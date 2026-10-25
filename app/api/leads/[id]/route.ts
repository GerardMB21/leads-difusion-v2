import { z } from 'zod';

import { updateLeadSchema } from '@/app/leads/schemas';
import { errorResponse, handleDbError } from '@/lib/response';
import { deleteLead } from '@/server/actions/leads/delete';
import { patchLead } from '@/server/actions/leads/patch';
import { LEAD_NOT_FOUND } from '@/server/queries/leads';

export async function PATCH(req: Request, ctx: RouteContext<'/api/leads/[id]'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  const body = await req.json().catch(() => null);
  const parsed = updateLeadSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await patchLead(id, parsed.data));
  } catch (error) {
    return handleDbError(error, {
      notFound: LEAD_NOT_FOUND,
      fallback: 'No se pudo actualizar el lead',
    });
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/leads/[id]'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  try {
    await deleteLead(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleDbError(error, {
      notFound: LEAD_NOT_FOUND,
      fallback: 'No se pudo eliminar el lead',
    });
  }
}
