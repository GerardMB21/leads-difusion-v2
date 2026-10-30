import { z } from 'zod';

import { resumeDiffusionSchema } from '@/app/diffusions/schemas';
import { errorResponse, handleDbError } from '@/lib/response';
import { resumeDiffusion } from '@/server/actions/diffusions/resume';
import { DIFFUSION_NOT_FOUND, DIFFUSION_NOT_RESUMABLE } from '@/server/queries/diffusions';

export async function POST(req: Request, ctx: RouteContext<'/api/diffusions/[id]/resume'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  const body = await req.json().catch(() => null);
  const parsed = resumeDiffusionSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await resumeDiffusion(id, parsed.data));
  } catch (error) {
    if (error instanceof Error && error.message === DIFFUSION_NOT_RESUMABLE) {
      return errorResponse({ status: 409, message: error.message });
    }

    return handleDbError(error, {
      notFound: DIFFUSION_NOT_FOUND,
      fallback: 'No se pudo reanudar la diffusion',
    });
  }
}
