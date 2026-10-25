'use server';

import type { LeadTag } from '@/app/pipelines/types';

import { db } from '@/prisma/db';

export async function getTags(): Promise<LeadTag[]> {
  const tags = await db.orm.public.Tag.where({ deletedAt: null })
    .orderBy((t) => t.name.asc())
    .all();

  return tags.map(({ id, name }) => ({ id, name }));
}
