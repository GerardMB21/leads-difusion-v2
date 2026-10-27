'use server';

import { deleteWorkflowsSchema, type DeleteWorkflowsInput } from '@/app/workflows/schemas';
import { db } from '@/prisma/db';
import { WORKFLOW_NOT_FOUND } from '@/server/queries/workflows';

export async function deleteWorkflow(id: number): Promise<void> {
  const workflow = await db.orm.public.WorkflowPipeline.where({ id, deletedAt: null }).update({
    deletedAt: new Date().toISOString(),
  });

  if (!workflow) throw new Error(WORKFLOW_NOT_FOUND);
}

export async function deleteWorkflows(input: DeleteWorkflowsInput): Promise<number> {
  const { ids } = deleteWorkflowsSchema.parse(input);

  const deleted = await db.orm.public.WorkflowPipeline.where((w) => w.id.in(ids))
    .where({ deletedAt: null })
    .updateAndCount({ deletedAt: new Date().toISOString() });

  if (!deleted) throw new Error(WORKFLOW_NOT_FOUND);

  return deleted;
}
