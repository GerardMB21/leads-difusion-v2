'use server';

import type { DiffusionRow } from '@/app/diffusions/types';

import { resumeDiffusionSchema, type ResumeDiffusionInput } from '@/app/diffusions/schemas';
import { db } from '@/prisma/db';
import { publishDiffusionChange } from '@/server/diffusions/events';
import { DIFFUSION_NOT_FOUND, DIFFUSION_NOT_RESUMABLE } from '@/server/queries/diffusions';
import { getDiffusion } from './get';

export async function resumeDiffusion(
  id: number,
  input: ResumeDiffusionInput,
): Promise<DiffusionRow> {
  const { retryFailed } = resumeDiffusionSchema.parse(input);

  await db.transaction(async (tx) => {
    const diffusion = await tx.orm.public.Diffusion.where({ id, deletedAt: null }).first();

    if (!diffusion) throw new Error(DIFFUSION_NOT_FOUND);

    const resumed = await tx.orm.public.Diffusion.where({ id, status: 'stopped' }).updateAndCount({
      status: 'pending',
      error: null,
      finishedAt: null,
      errorServer: 0,
      restartAt: new Date().toISOString(),
    });

    if (!resumed) throw new Error(DIFFUSION_NOT_RESUMABLE);

    if (retryFailed) {
      await tx.orm.public.LeadInDiffusion.where({ diffusionId: id, status: 'failed' }).update({
        status: 'pending',
        templateId: null,
        waited: null,
        sentAt: null,
        error: null,
      });
    }
  });

  publishDiffusionChange();

  return getDiffusion(id);
}
