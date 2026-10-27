'use server';

import { deleteLeadsSchema, type DeleteLeadsInput } from '@/app/leads/schemas';
import { db } from '@/prisma/db';
import { LEAD_NOT_FOUND } from '@/server/queries/leads';

export async function deleteLead(id: number): Promise<void> {
  const lead = await db.orm.public.Lead.where({ id, deletedAt: null }).update({
    deletedAt: new Date().toISOString(),
  });

  if (!lead) throw new Error(LEAD_NOT_FOUND);
}

export async function deleteLeads(input: DeleteLeadsInput): Promise<number> {
  const { ids } = deleteLeadsSchema.parse(input);

  const deleted = await db.orm.public.Lead.where((l) => l.id.in(ids))
    .where({ deletedAt: null })
    .updateAndCount({ deletedAt: new Date().toISOString() });

  if (!deleted) throw new Error(LEAD_NOT_FOUND);

  return deleted;
}
