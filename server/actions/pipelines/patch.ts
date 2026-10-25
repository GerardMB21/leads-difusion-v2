'use server';

import type { Pipeline } from '@/app/pipelines/types';

import { updatePipelineSchema, type UpdatePipelineInput } from '@/app/pipelines/schemas';
import { db } from '@/prisma/db';

export async function patchPipeline(
  id: number,
  input: UpdatePipelineInput,
): Promise<Omit<Pipeline, 'leads'>> {
  const data = updatePipelineSchema.parse(input);

  const pipeline = await db.orm.public.Pipeline.where({ id, deletedAt: null }).update(data);

  if (!pipeline) throw new Error('Pipeline no encontrado');

  return pipeline;
}
