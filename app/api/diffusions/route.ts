import { z } from 'zod';

import { createDiffusionSchema, diffusionFiltersSchema } from '@/app/diffusions/schemas';
import { errorResponse, handleDbError } from '@/lib/response';
import { getDiffusions } from '@/server/actions/diffusions/get';
import { createDiffusion } from '@/server/actions/diffusions/post';
import { DIFFUSION_NOT_FOUND, DIFFUSION_VALIDATION_ERRORS } from '@/server/queries/diffusions';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = diffusionFiltersSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await getDiffusions(parsed.data));
  } catch (error) {
    return handleDbError(error, {
      notFound: DIFFUSION_NOT_FOUND,
      fallback: 'No se pudieron obtener las diffusions',
    });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createDiffusionSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await createDiffusion(parsed.data), { status: 201 });
  } catch (error) {
    if (error instanceof Error && DIFFUSION_VALIDATION_ERRORS.includes(error.message)) {
      return errorResponse({ status: 400, message: error.message });
    }

    return handleDbError(error, {
      notFound: DIFFUSION_NOT_FOUND,
      fallback: 'No se pudo crear la diffusion',
    });
  }
}
