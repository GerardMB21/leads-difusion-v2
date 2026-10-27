'use server';

import type { Workflow } from '@/app/workflows/types';

import { createWorkflowSchema, type CreateWorkflowInput } from '@/app/workflows/schemas';
import { db } from '@/prisma/db';
import { resolvePipelineId, SAME_PIPELINE } from '@/server/queries/workflows';

export async function createWorkflow(input: CreateWorkflowInput): Promise<Workflow> {
  const { fromPipelineId, fromPipelineName, toPipelineId, toPipelineName, ...data } =
    createWorkflowSchema.parse(input);

  return db.transaction(async (tx) => {
    const from = await resolvePipelineId(tx, fromPipelineId, fromPipelineName);
    const to = await resolvePipelineId(tx, toPipelineId, toPipelineName);

    if (from === to) throw new Error(SAME_PIPELINE);

    return tx.orm.public.WorkflowPipeline.create({
      ...data,
      waitingTime: data.whenNotResponse ? (data.waitingTime ?? 0) : 0,
      fromPipelineId: from,
      toPipelineId: to,
    });
  });
}
