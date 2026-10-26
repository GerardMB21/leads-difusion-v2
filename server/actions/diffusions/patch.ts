'use server';

import type { DiffusionRow } from '@/app/diffusions/types';

import {
  isCancellable,
  updateDiffusionSchema,
  type UpdateDiffusionInput,
} from '@/app/diffusions/schemas';
import { db } from '@/prisma/db';
import { DIFFUSION_NOT_CANCELLABLE, DIFFUSION_NOT_FOUND } from '@/server/queries/diffusions';
import { getDiffusion } from './get';

export async function patchDiffusion(
  id: number,
  input: UpdateDiffusionInput,
): Promise<DiffusionRow> {
  const data = updateDiffusionSchema.parse(input);

  await db.transaction(async (tx) => {
    const diffusion = await tx.orm.public.Diffusion.where({ id, deletedAt: null }).first();

    if (!diffusion) throw new Error(DIFFUSION_NOT_FOUND);

    const cancelling = data.status === 'cancelled';

    if (cancelling && !isCancellable(diffusion.status)) throw new Error(DIFFUSION_NOT_CANCELLABLE);

    await tx.orm.public.Diffusion.where({ id }).update({
      ...data,
      ...(cancelling && { finishedAt: new Date().toISOString() }),
    });
  });

  return getDiffusion(id);
}
