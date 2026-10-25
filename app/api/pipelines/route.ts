import { z } from 'zod';

import type { NormalizedError } from '@/lib/types';

import { createPipelineSchema } from '@/app/pipelines/schemas';
import { createPipeline } from '@/server/actions/pipelines/post';
import { getPipelines } from '@/server/actions/pipelines/get';

const UNIQUE_VIOLATION = '23505';

function errorResponse({ status, message }: NormalizedError) {
  return Response.json({ status, message } satisfies NormalizedError, { status });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const query = Object.fromEntries(searchParams);

  const pipelines = await getPipelines(query);

  return Response.json(pipelines);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createPipelineSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    const pipeline = await createPipeline(parsed.data);

    return Response.json(pipeline, { status: 201 });
  } catch (error) {
    if ((error as { sqlState?: string }).sqlState === UNIQUE_VIOLATION) {
      return errorResponse({ status: 409, message: 'Ya existe un pipeline con ese nombre' });
    }

    console.error('Create pipeline error: ', error);

    return errorResponse({ status: 500, message: 'No se pudo crear el pipeline' });
  }
}
