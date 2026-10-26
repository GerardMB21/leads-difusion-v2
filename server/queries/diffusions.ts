import type { DiffusionStatus, LeadInDiffusionStatus } from '@/app/diffusions/types';

import { db } from '@/prisma/db';

export const DIFFUSION_NOT_FOUND = 'Diffusion no encontrada';
export const DIFFUSION_NOT_CANCELLABLE =
  'Solo se pueden cancelar diffusions activas, pendientes o en envío';
export const INVALID_REFERENCES = 'Algún lead, template, etiqueta o pipeline ya no existe';

export const DIFFUSION_VALIDATION_ERRORS = [DIFFUSION_NOT_CANCELLABLE, INVALID_REFERENCES];

export type DiffusionStats = {
  total: number;
  processed: number;
  sent: number;
  failed: number;
};

const EMPTY_STATS: DiffusionStats = { total: 0, processed: 0, sent: 0, failed: 0 };

export async function getDiffusionStats(ids: number[]): Promise<Map<number, DiffusionStats>> {
  const stats = new Map<number, DiffusionStats>();

  if (!ids.length) return stats;

  const rows = await db.orm.public.LeadInDiffusion.where((l) => l.diffusionId.in(ids))
    .where({ deletedAt: null })
    .groupBy('diffusionId', 'status')
    .aggregate((aggregate) => ({ count: aggregate.count() }));

  for (const { diffusionId, status, count } of rows) {
    const current = stats.get(diffusionId) ?? { ...EMPTY_STATS };
    const state = status as LeadInDiffusionStatus;

    current.total += count;
    if (state !== 'pending') current.processed += count;
    if (state === 'sent') current.sent += count;
    if (state === 'failed') current.failed += count;

    stats.set(diffusionId, current);
  }

  return stats;
}

export const emptyStats = (): DiffusionStats => ({ ...EMPTY_STATS });

export type { DiffusionStatus };
