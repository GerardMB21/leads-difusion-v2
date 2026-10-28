import { db } from '@/prisma/db';
import { moveLeads, type Tx } from '@/server/workflows/moveLeads';
import { phoneCandidates } from './phone';

export async function setLastContact(
  tx: Tx,
  phone: string,
  messageId: string | null,
  contactedAt = new Date().toISOString(),
) {
  const candidates = phoneCandidates(phone);

  if (!candidates.length) return 0;

  const leads = await tx.orm.public.Lead.where((l) => l.phone.in(candidates))
    .where({ deletedAt: null })
    .all();

  for (const lead of leads) {
    await tx.orm.public.Lead.where({ id: lead.id }).update({
      lastContact: contactedAt,
      messageResponse: false,
      ...(messageId && { lastMessageId: messageId }),
    });

    const workflow = (
      await tx.orm.public.WorkflowPipeline.where({
        fromPipelineId: lead.pipelineId,
        whenSendMessage: true,
        deletedAt: null,
      })
        .orderBy((w) => w.id.desc())
        .all()
    ).find((w) => w.toPipelineId !== w.fromPipelineId);

    if (workflow) {
      await moveLeads(tx, [lead.id], workflow.fromPipelineId, workflow.toPipelineId);
    }
  }

  return leads.length;
}

export async function markLeadContacted(phone: string, messageId: string | null) {
  try {
    await db.transaction((tx) => setLastContact(tx, phone, messageId));
  } catch (error) {
    console.error('Lead contact error: ', error);
  }
}

export async function markLeadWithoutWhatsapp(phone: string) {
  const candidates = phoneCandidates(phone);

  if (!candidates.length) return;

  try {
    await db.orm.public.Lead.where((l) => l.phone.in(candidates))
      .where({ deletedAt: null })
      .updateAll({ hasWhatsapp: false });
  } catch (error) {
    console.error('Lead hasWhatsapp error: ', error);
  }
}
