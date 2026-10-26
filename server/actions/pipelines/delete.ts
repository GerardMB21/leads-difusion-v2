'use server';

import { db } from '@/prisma/db';

export async function deletePipeline(id: number): Promise<void> {
  await db.transaction(async (tx) => {
    const deletedAt = new Date().toISOString();

    const pipeline = await tx.orm.public.Pipeline.where({ id, deletedAt: null }).update({
      deletedAt,
    });

    if (!pipeline) throw new Error('Pipeline no encontrado');

    await tx.orm.public.WorkflowPipeline.where({ fromPipelineId: id, deletedAt: null }).updateAll({
      deletedAt,
    });
    await tx.orm.public.WorkflowPipeline.where({ toPipelineId: id, deletedAt: null }).updateAll({
      deletedAt,
    });
  });
}
