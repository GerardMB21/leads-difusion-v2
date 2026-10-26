'use server';

import { db } from '@/prisma/db';
import { WORKFLOW_NOT_FOUND } from '@/server/queries/workflows';

export async function deleteWorkflow(id: number): Promise<void> {
  const workflow = await db.orm.public.WorkflowPipeline.where({ id, deletedAt: null }).update({
    deletedAt: new Date().toISOString(),
  });

  if (!workflow) throw new Error(WORKFLOW_NOT_FOUND);
}
