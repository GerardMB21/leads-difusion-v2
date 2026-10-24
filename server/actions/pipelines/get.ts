'use server';

import { db } from '@/prisma/db';

export async function getPipelines() {
  return db.orm.public.Pipeline.where((p) => p.deletedAt.isNull())
    .orderBy((p) => p.order.asc())
    .all();
}
