'use server';

import { reorderSchema, type ReorderInput } from '@/app/pipelines/schemas';
import { db } from '@/prisma/db';

const PIPELINE_NOT_FOUND = 'Pipeline no encontrado';
const LEAD_NOT_FOUND = 'Lead no encontrado';

export async function reorderKanban(input: ReorderInput): Promise<void> {
  const { pipelines, leads } = reorderSchema.parse(input);

  await db.transaction(async (tx) => {
    for (const { id, order } of pipelines) {
      const pipeline = await tx.orm.public.Pipeline.where({ id, deletedAt: null }).update({
        order,
      });

      if (!pipeline) throw new Error(PIPELINE_NOT_FOUND);
    }

    for (const { id, order, pipelineId, beforePipelineId } of leads) {
      const lead = await tx.orm.public.Lead.where({ id, deletedAt: null }).update({
        order,
        pipelineId,
        ...(beforePipelineId && { beforePipelineId }),
      });

      if (!lead) throw new Error(LEAD_NOT_FOUND);
    }
  });
}
