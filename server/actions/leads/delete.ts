'use server';

import { db } from '@/prisma/db';
import { LEAD_NOT_FOUND } from '@/server/queries/leads';

export async function deleteLead(id: number): Promise<void> {
  const lead = await db.orm.public.Lead.where({ id, deletedAt: null }).update({
    deletedAt: new Date().toISOString(),
  });

  if (!lead) throw new Error(LEAD_NOT_FOUND);
}
