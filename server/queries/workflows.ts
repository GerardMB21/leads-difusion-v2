import type { db } from '@/prisma/db';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const WORKFLOW_NOT_FOUND = 'Workflow no encontrado';
export const PIPELINE_NOT_FOUND = 'Pipeline no encontrado';
export const SAME_PIPELINE = 'El pipeline de origen y destino deben ser distintos';

export const WORKFLOW_VALIDATION_ERRORS = [PIPELINE_NOT_FOUND, SAME_PIPELINE];

export async function resolvePipelineId(tx: Tx, id?: number, name?: string): Promise<number> {
  if (id !== undefined) {
    const pipeline = await tx.orm.public.Pipeline.where({ id, deletedAt: null }).first();

    if (!pipeline) throw new Error(PIPELINE_NOT_FOUND);

    return pipeline.id;
  }

  const existing = await tx.orm.public.Pipeline.where({ name: name! }).first();

  if (existing && !existing.deletedAt) return existing.id;

  const order = (await tx.orm.public.Pipeline.where({ deletedAt: null }).all()).length;

  if (existing) {
    await tx.orm.public.Pipeline.where({ id: existing.id }).update({ deletedAt: null, order });

    return existing.id;
  }

  return (await tx.orm.public.Pipeline.create({ name: name!, order, default: false })).id;
}
