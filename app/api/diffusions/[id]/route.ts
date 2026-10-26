import { z } from 'zod';

import { updateDiffusionSchema } from '@/app/diffusions/schemas';
import { errorResponse, handleDbError } from '@/lib/response';
import { deleteDiffusion } from '@/server/actions/diffusions/delete';
import { patchDiffusion } from '@/server/actions/diffusions/patch';
import { DIFFUSION_NOT_CANCELLABLE, DIFFUSION_NOT_FOUND } from '@/server/queries/diffusions';

export async function PATCH(req: Request, ctx: RouteContext<'/api/diffusions/[id]'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  const body = await req.json().catch(() => null);
  const parsed = updateDiffusionSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await patchDiffusion(id, parsed.data));
  } catch (error) {
    if (error instanceof Error && error.message === DIFFUSION_NOT_CANCELLABLE) {
      return errorResponse({ status: 409, message: error.message });
    }

    return handleDbError(error, {
      notFound: DIFFUSION_NOT_FOUND,
      fallback: 'No se pudo actualizar la diffusion',
    });
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/diffusions/[id]'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  try {
    await deleteDiffusion(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleDbError(error, {
      notFound: DIFFUSION_NOT_FOUND,
      fallback: 'No se pudo eliminar la diffusion',
    });
  }
}
