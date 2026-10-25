'use server';

import { db } from '@/prisma/db';

export async function deletePipeline(id: number): Promise<void> {
  const pipeline = await db.orm.public.Pipeline.where({ id, deletedAt: null }).update({
    deletedAt: new Date().toISOString(),
  });

  if (!pipeline) throw new Error('Pipeline no encontrado');
}
