import { isAxiosError } from 'axios';
import { or } from '@prisma/orm-postgres/orm-client';

import { db } from '@/prisma/db';
import { getDiffusionStats, RUNNING_STATUSES } from '@/server/queries/diffusions';
import { publishDiffusionChange } from './events';
import { sendTemplateMessage } from '@/server/whatsapp/evolution';
import type { Tx } from '@/server/workflows/moveLeads';

const MINUTE_MS = 60_000;
const STALE_SENDING_MS = 5 * MINUTE_MS;
const MAX_ERROR_LENGTH = 500;

export const DIFFUSION_INTERVALS_MINUTES = [3, 5, 8, 10];

const pickRandom = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

function describeSendError(error: unknown) {
  let message = 'Error desconocido';

  if (isAxiosError(error)) {
    const data = error.response?.data?.response?.message ?? error.response?.data?.message;

    message = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return message.slice(0, MAX_ERROR_LENGTH);
}

async function syncStats(tx: Tx, diffusionId: number) {
  const stats = (await getDiffusionStats([diffusionId])).get(diffusionId);

  if (!stats) return;

  await tx.orm.public.Diffusion.where({ id: diffusionId }).update({
    processed: stats.processed,
    sent: stats.sent,
    failed: stats.failed,
  });
}

const nextPendingLead = (tx: Tx, diffusionId: number) =>
  tx.orm.public.LeadInDiffusion.where({ diffusionId, status: 'pending', deletedAt: null })
    .orderBy((l) => l.id.asc())
    .first();

async function failStaleLeads(tx: Tx, diffusionId: number, now: Date) {
  const limit = new Date(now.getTime() - STALE_SENDING_MS).toISOString();

  await tx.orm.public.LeadInDiffusion.where({ diffusionId, status: 'sending' })
    .where((l) => l.updatedAt.lte(limit))
    .updateAndCount({ status: 'failed', error: 'Envío interrumpido', sentAt: now.toISOString() });
}

async function sendToLead(diffusionId: number, leadInDiffusionId: number, leadId: number) {
  const prepared = await db.transaction(async (tx) => {
    const [lead, links, previous] = await Promise.all([
      tx.orm.public.Lead.where({ id: leadId, deletedAt: null }).first(),
      tx.orm.public.TemplateInDiffusion.where({ diffusionId }).include('template').all(),
      tx.orm.public.LeadInDiffusion.where({ diffusionId })
        .where((l) => l.sentAt.isNotNull())
        .orderBy((l) => l.sentAt.desc())
        .first(),
    ]);

    const templates = links.map(({ template }) => template).filter((t) => t && !t.deletedAt);
    const template = templates.length ? pickRandom(templates) : null;
    const waited = previous?.sentAt
      ? Math.round((Date.now() - Date.parse(previous.sentAt)) / MINUTE_MS)
      : null;

    if (template) {
      await tx.orm.public.LeadInDiffusion.where({ id: leadInDiffusionId }).update({
        templateId: template.id,
        waited,
      });
    }

    return { lead, template, waited };
  });

  const { lead, template } = prepared;
  const sentAt = () => new Date().toISOString();

  if (!lead) return { ok: false as const, error: 'Lead no encontrado', sentAt: sentAt() };
  if (!template)
    return { ok: false as const, error: 'Sin templates disponibles', sentAt: sentAt() };

  try {
    await sendTemplateMessage({
      phone: lead.phone,
      template: { name: template.name, message: template.message, img: template.img },
    });

    return { ok: true as const, sentAt: sentAt() };
  } catch (error) {
    console.error(`[cron:diffusions] fallo el envio al lead ${leadId}:`, describeSendError(error));

    return { ok: false as const, error: describeSendError(error), sentAt: sentAt() };
  }
}

const updateRunning = (tx: Tx, diffusionId: number, data: Record<string, unknown>) =>
  tx.orm.public.Diffusion.where({ id: diffusionId })
    .where((d) => d.status.in([...RUNNING_STATUSES]))
    .updateAndCount(data);

const complete = (tx: Tx, diffusionId: number) =>
  updateRunning(tx, diffusionId, {
    status: 'completed',
    nextSendAt: null,
    finishedAt: new Date().toISOString(),
  });

async function processDiffusion(diffusionId: number, now: Date) {
  for (;;) {
    const state = await db.transaction(async (tx) => {
      const diffusion = await tx.orm.public.Diffusion.where({
        id: diffusionId,
        deletedAt: null,
      }).first();

      if (!diffusion || !(RUNNING_STATUSES as readonly string[]).includes(diffusion.status)) {
        return 'stop' as const;
      }

      await failStaleLeads(tx, diffusionId, now);

      const busy = await tx.orm.public.LeadInDiffusion.where({
        diffusionId,
        status: 'sending',
      }).first();

      if (busy) return 'stop' as const;

      const lead = await nextPendingLead(tx, diffusionId);

      if (!lead) {
        await syncStats(tx, diffusionId);
        await complete(tx, diffusionId);

        return 'stop' as const;
      }

      const claimed = await tx.orm.public.LeadInDiffusion.where({
        id: lead.id,
        status: 'pending',
      }).updateAndCount({ status: 'sending' });

      if (!claimed) return 'stop' as const;

      const started = await updateRunning(tx, diffusionId, { status: 'sending', nextSendAt: null });

      if (!started) {
        await tx.orm.public.LeadInDiffusion.where({ id: lead.id }).update({ status: 'pending' });

        return 'stop' as const;
      }

      return lead;
    });

    publishDiffusionChange();

    if (state === 'stop') return;

    const result = await sendToLead(diffusionId, state.id, state.leadId);

    const more = await db.transaction(async (tx) => {
      await tx.orm.public.LeadInDiffusion.where({ id: state.id }).update({
        status: result.ok ? 'sent' : 'failed',
        sentAt: result.sentAt,
        error: result.ok ? null : result.error,
      });
      await syncStats(tx, diffusionId);

      const pending = await nextPendingLead(tx, diffusionId);

      if (!pending) {
        await complete(tx, diffusionId);

        return false;
      }

      if (result.ok) {
        const minutes = pickRandom(DIFFUSION_INTERVALS_MINUTES);

        return (
          (await updateRunning(tx, diffusionId, {
            status: 'active',
            nextSendAt: new Date(Date.now() + minutes * MINUTE_MS).toISOString(),
          })) > 0
        );
      }

      return (await updateRunning(tx, diffusionId, { status: 'failed' })) > 0;
    });

    publishDiffusionChange();

    if (!more || result.ok) return;
  }
}

async function pickDiffusion(now: Date) {
  const running = await db.orm.public.Diffusion.where({ deletedAt: null })
    .where((d) => d.status.in([...RUNNING_STATUSES]))
    .orderBy((d) => d.id.asc())
    .first();

  if (running) return running;

  const due = now.toISOString();

  const started = await db.transaction(async (tx) => {
    const next = await tx.orm.public.Diffusion.where({ status: 'pending', deletedAt: null })
      .where((d) => or(d.startAt.isNull(), d.startAt.lte(due)))
      .orderBy((d) => d.id.asc())
      .first();

    if (!next) return null;

    const claimed = await tx.orm.public.Diffusion.where({
      id: next.id,
      status: 'pending',
    }).updateAndCount({ status: 'active', nextSendAt: null, startAt: next.startAt ?? due });

    return claimed ? next : null;
  });

  if (started) publishDiffusionChange();

  return started;
}

export async function runDiffusions(now = new Date()) {
  const diffusion = await pickDiffusion(now);

  if (!diffusion) return;

  if (diffusion.nextSendAt && Date.parse(diffusion.nextSendAt) > now.getTime()) return;

  await processDiffusion(diffusion.id, now);
}
