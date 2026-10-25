import { z } from 'zod';

import { errorResponse } from '@/lib/response';
import { reorderSchema } from '@/app/pipelines/schemas';
import { reorderKanban } from '@/server/actions/pipelines/reorder';

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    await reorderKanban(parsed.data);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.endsWith('no encontrado')) {
      return errorResponse({ status: 404, message: error.message });
    }

    if ((error as { sqlState?: string }).sqlState === '23503') {
      return errorResponse({ status: 400, message: 'Referencia inválida: el pipeline no existe' });
    }

    console.error('No se pudo guardar el orden: ', error);

    return errorResponse({ status: 500, message: 'No se pudo guardar el orden' });
  }
}
