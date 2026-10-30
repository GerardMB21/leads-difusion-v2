'use server';

import type { DiffusionRow } from '@/app/diffusions/types';

import { STOPPABLE_STATUSES } from '@/app/diffusions/schemas';
import { db } from '@/prisma/db';
import { publishDiffusionChange } from '@/server/diffusions/events';
import { DIFFUSION_NOT_FOUND, DIFFUSION_NOT_STOPPABLE } from '@/server/queries/diffusions';
import { getDiffusion } from './get';

export async function stopDiffusion(id: number): Promise<DiffusionRow> {
  await db.transaction(async (tx) => {
    const diffusion = await tx.orm.public.Diffusion.where({ id, deletedAt: null }).first();

    if (!diffusion) throw new Error(DIFFUSION_NOT_FOUND);

    const stopped = await tx.orm.public.Diffusion.where({ id })
      .where((d) => d.status.in([...STOPPABLE_STATUSES]))
      .updateAndCount({
        status: 'stopped',
        nextSendAt: null,
        stoppedAt: new Date().toISOString(),
      });

    if (!stopped) throw new Error(DIFFUSION_NOT_STOPPABLE);
  });

  publishDiffusionChange();

  return getDiffusion(id);
}
