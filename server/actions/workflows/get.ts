'use server';

import type { WorkflowRow } from '@/app/workflows/types';

import { workflowFiltersSchema, type WorkflowFilters } from '@/app/workflows/schemas';
import { OrderBy } from '@/lib/types';
import { db } from '@/prisma/db';

const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');

export async function getWorkflows(query: WorkflowFilters = {}): Promise<WorkflowRow[]> {
  const { orderBy, name, trigger, ...filters } = workflowFiltersSchema.parse(query);

  let workflows = db.orm.public.WorkflowPipeline.where({
    ...filters,
    ...(trigger === 'notResponse' && { whenNotResponse: true }),
    ...(trigger === 'sendMessage' && { whenSendMessage: true }),
    deletedAt: null,
  });

  if (name) workflows = workflows.where((w) => w.name.ilike(`%${escapeLike(name)}%`));

  const rows = await workflows
    .orderBy((w) => (orderBy === OrderBy.DESC ? w.id.desc() : w.id.asc()))
    .include('fromPipeline')
    .include('toPipeline')
    .all();

  return rows.map(({ fromPipeline, toPipeline, ...workflow }) => ({
    ...workflow,
    fromPipeline: { id: fromPipeline.id, name: fromPipeline.name },
    toPipeline: { id: toPipeline.id, name: toPipeline.name },
  }));
}
