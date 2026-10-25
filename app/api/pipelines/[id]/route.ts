import { z } from 'zod';

import type { NormalizedError } from '@/lib/types';

import { updatePipelineSchema } from '@/app/pipelines/schemas';
import { deletePipeline } from '@/server/actions/pipelines/delete';
import { patchPipeline } from '@/server/actions/pipelines/patch';

const UNIQUE_VIOLATION = '23505';
const NOT_FOUND = 'Pipeline no encontrado';

function errorResponse({ status, message }: NormalizedError) {
  return Response.json({ status, message } satisfies NormalizedError, { status });
}

function handleError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === NOT_FOUND) {
    return errorResponse({ status: 404, message: NOT_FOUND });
  }

  if ((error as { sqlState?: string }).sqlState === UNIQUE_VIOLATION) {
    return errorResponse({ status: 409, message: 'Ya existe un pipeline con ese nombre' });
  }

  console.error(`${fallback}: `, error);

  return errorResponse({ status: 500, message: fallback });
}

export async function PATCH(req: Request, ctx: RouteContext<'/api/pipelines/[id]'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  const body = await req.json().catch(() => null);
  const parsed = updatePipelineSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await patchPipeline(id, parsed.data));
  } catch (error) {
    return handleError(error, 'No se pudo actualizar el pipeline');
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/pipelines/[id]'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  try {
    await deletePipeline(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleError(error, 'No se pudo eliminar el pipeline');
  }
}
