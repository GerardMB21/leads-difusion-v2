import type { Lead } from '@/app/leads/types';

import { db } from '@/prisma/db';

export const LEAD_NOT_FOUND = 'Lead no encontrado';

export function toLead<T extends { tags: { tag: { id: number; name: string } }[] }>(row: T) {
  return {
    ...row,
    tags: row.tags.map(({ tag }) => ({ id: tag.id, name: tag.name })),
  };
}

export async function findLead(id: number): Promise<Lead | null> {
  const row = await db.orm.public.Lead.where({ id, deletedAt: null })
    .include('tags', (tags) => tags.include('tag'))
    .first();

  return row ? toLead(row) : null;
}
