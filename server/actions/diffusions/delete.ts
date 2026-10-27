'use server';

import { db } from '@/prisma/db';
import { publishDiffusionChange } from '@/server/diffusions/events';
import { DIFFUSION_NOT_FOUND } from '@/server/queries/diffusions';

export async function deleteDiffusion(id: number): Promise<void> {
  const diffusion = await db.orm.public.Diffusion.where({ id, deletedAt: null }).update({
    deletedAt: new Date().toISOString(),
  });

  if (!diffusion) throw new Error(DIFFUSION_NOT_FOUND);

  publishDiffusionChange();
}
