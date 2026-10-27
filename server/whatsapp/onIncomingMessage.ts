import type { IncomingMessage } from '@/app/whatsapp/types';

import type { Tx } from '@/server/workflows/moveLeads';

import { db } from '@/prisma/db';
import { moveLeads } from '@/server/workflows/moveLeads';
import { phoneCandidates } from './phone';

export type IncomingMessageResult = {
  messageId: string;
  phone: string;
  leadId: number | null;
  movedToPipelineId: number | null;
};

export function onIncomingMessage(message: IncomingMessage): Promise<IncomingMessageResult> {
  return db.transaction((tx) => processIncomingMessage(tx, message));
}

export async function processIncomingMessage(
  tx: Tx,
  message: IncomingMessage,
): Promise<IncomingMessageResult> {
  const result: IncomingMessageResult = {
    messageId: message.messageId,
    phone: message.phone,
    leadId: null,
    movedToPipelineId: null,
  };

  const candidates = phoneCandidates(message.phone);

  if (!candidates.length) return result;

  const lead = await tx.orm.public.Lead.where((l) => l.phone.in(candidates))
    .where({ deletedAt: null })
    .orderBy((l) => l.updatedAt.desc())
    .first();

  if (!lead) return result;

  result.leadId = lead.id;

  const now = message.timestamp.toISOString();
  const isNewResponse =
    !lead.messageResponse ||
    !lead.lastResponseAt ||
    (!!lead.movedAt && Date.parse(lead.lastResponseAt) <= Date.parse(lead.movedAt));

  await tx.orm.public.Lead.where({ id: lead.id }).update({
    messageResponse: true,
    ...(isNewResponse && { lastResponseAt: now }),
  });

  const workflow = (
    await tx.orm.public.WorkflowPipeline.where({
      fromPipelineId: lead.pipelineId,
      whenResponse: true,
      deletedAt: null,
    })
      .orderBy((w) => w.id.desc())
      .all()
  ).find((w) => w.toPipelineId !== w.fromPipelineId);

  if (!workflow || workflow.waitingTime > 0) return result;

  const [moved] = await moveLeads(tx, [lead.id], workflow.fromPipelineId, workflow.toPipelineId);

  if (moved) result.movedToPipelineId = workflow.toPipelineId;

  return result;
}
