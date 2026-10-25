import type { Lead } from '@/app/leads/types';

import { db } from '@/prisma/db';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const LEAD_NOT_FOUND = 'Lead no encontrado';
export const PIPELINE_NOT_FOUND = 'Pipeline no encontrado';

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

export async function resolveTagIds(tx: Tx, tagIds: number[] = [], tagNames: string[] = []) {
  const ids = new Set(tagIds);

  for (const name of new Set(tagNames)) {
    const existing = await tx.orm.public.Tag.where({ name }).first();

    if (existing) {
      if (existing.deletedAt)
        await tx.orm.public.Tag.where({ id: existing.id }).update({ deletedAt: null });

      ids.add(existing.id);
    } else {
      ids.add((await tx.orm.public.Tag.create({ name })).id);
    }
  }

  return [...ids];
}
