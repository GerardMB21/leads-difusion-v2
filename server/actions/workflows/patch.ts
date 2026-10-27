'use server';

import type { Workflow } from '@/app/workflows/types';

import { updateWorkflowSchema, type UpdateWorkflowInput } from '@/app/workflows/schemas';
import { db } from '@/prisma/db';
import { resolvePipelineId, SAME_PIPELINE, WORKFLOW_NOT_FOUND } from '@/server/queries/workflows';

export async function patchWorkflow(id: number, input: UpdateWorkflowInput): Promise<Workflow> {
  const { fromPipelineId, fromPipelineName, toPipelineId, toPipelineName, ...data } =
    updateWorkflowSchema.parse(input);

  return db.transaction(async (tx) => {
    const current = await tx.orm.public.WorkflowPipeline.where({ id, deletedAt: null }).first();

    if (!current) throw new Error(WORKFLOW_NOT_FOUND);

    const from =
      fromPipelineId !== undefined || fromPipelineName !== undefined
        ? await resolvePipelineId(tx, fromPipelineId, fromPipelineName)
        : current.fromPipelineId;
    const to =
      toPipelineId !== undefined || toPipelineName !== undefined
        ? await resolvePipelineId(tx, toPipelineId, toPipelineName)
        : current.toPipelineId;

    if (from === to) throw new Error(SAME_PIPELINE);

    const whenNotResponse = data.whenNotResponse ?? current.whenNotResponse;

    const workflow = await tx.orm.public.WorkflowPipeline.where({ id }).update({
      ...data,
      ...(!whenNotResponse && { waitingTime: 0 }),
      fromPipelineId: from,
      toPipelineId: to,
    });

    if (!workflow) throw new Error(WORKFLOW_NOT_FOUND);

    return workflow;
  });
}
