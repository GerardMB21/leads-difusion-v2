'use server';

import type { Pipeline } from '@/app/pipelines/types';

import { createPipelineSchema, type CreatePipelineInput } from '@/app/pipelines/schemas';
import { db } from '@/prisma/db';

export async function createPipeline(input: CreatePipelineInput): Promise<Pipeline> {
  const data = createPipelineSchema.parse(input);

  const pipeline = await db.orm.public.Pipeline.create(data);

  return { ...pipeline, leads: [] };
}
