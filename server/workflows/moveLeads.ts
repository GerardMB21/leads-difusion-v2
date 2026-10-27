import { db } from '@/prisma/db';

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function moveLeads(
  tx: Tx,
  leadIds: number[],
  fromPipelineId: number,
  toPipelineId: number,
  movedAt = new Date().toISOString(),
) {
  if (!leadIds.length) return [];

  const { last } = await tx.orm.public.Lead.where({
    pipelineId: toPipelineId,
    deletedAt: null,
  }).aggregate((aggregate) => ({ last: aggregate.max('order') }));

  let order = (last ?? -1) + 1;

  const moved: number[] = [];

  for (const id of leadIds) {
    const lead = await tx.orm.public.Lead.where({
      id,
      pipelineId: fromPipelineId,
      deletedAt: null,
    }).update({
      pipelineId: toPipelineId,
      beforePipelineId: fromPipelineId,
      order,
      movedAt,
    });

    if (!lead) continue;

    moved.push(id);
    order++;
  }

  return moved;
}
