import { z } from 'zod';

import { updateWorkflowSchema } from '@/app/workflows/schemas';
import { errorResponse, handleDbError } from '@/lib/response';
import { deleteWorkflow } from '@/server/actions/workflows/delete';
import { patchWorkflow } from '@/server/actions/workflows/patch';
import { WORKFLOW_NOT_FOUND, WORKFLOW_VALIDATION_ERRORS } from '@/server/queries/workflows';

export async function PATCH(req: Request, ctx: RouteContext<'/api/workflows/[id]'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  const body = await req.json().catch(() => null);
  const parsed = updateWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await patchWorkflow(id, parsed.data));
  } catch (error) {
    if (error instanceof Error && WORKFLOW_VALIDATION_ERRORS.includes(error.message)) {
      return errorResponse({ status: 400, message: error.message });
    }

    return handleDbError(error, {
      notFound: WORKFLOW_NOT_FOUND,
      fallback: 'No se pudo actualizar el workflow',
    });
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/workflows/[id]'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  try {
    await deleteWorkflow(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleDbError(error, {
      notFound: WORKFLOW_NOT_FOUND,
      fallback: 'No se pudo eliminar el workflow',
    });
  }
}
