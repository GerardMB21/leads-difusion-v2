import { errorResponse, handleDbError } from '@/lib/response';
import { stopDiffusion } from '@/server/actions/diffusions/stop';
import { DIFFUSION_NOT_FOUND, DIFFUSION_NOT_STOPPABLE } from '@/server/queries/diffusions';

export async function POST(_req: Request, ctx: RouteContext<'/api/diffusions/[id]/stop'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  try {
    return Response.json(await stopDiffusion(id));
  } catch (error) {
    if (error instanceof Error && error.message === DIFFUSION_NOT_STOPPABLE) {
      return errorResponse({ status: 409, message: error.message });
    }

    return handleDbError(error, {
      notFound: DIFFUSION_NOT_FOUND,
      fallback: 'No se pudo detener la diffusion',
    });
  }
}
