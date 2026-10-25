import { z } from 'zod';

import { updateTemplateSchema } from '@/app/templates/schemas';
import { getFile, getString } from '@/lib/formData';
import { errorResponse, handleDbError } from '@/lib/response';
import { deleteTemplate } from '@/server/actions/templates/delete';
import { getTemplate } from '@/server/actions/templates/get';
import { patchTemplate } from '@/server/actions/templates/patch';
import { TEMPLATE_NOT_FOUND } from '@/server/queries/templates';

export async function GET(_req: Request, ctx: RouteContext<'/api/templates/[id]'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  try {
    return Response.json(await getTemplate(id));
  } catch (error) {
    return handleDbError(error, {
      notFound: TEMPLATE_NOT_FOUND,
      fallback: 'No se pudo obtener el template',
    });
  }
}

export async function PATCH(req: Request, ctx: RouteContext<'/api/templates/[id]'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  const form = await req.formData().catch(() => null);

  if (!form) return errorResponse({ status: 400, message: 'Solicitud inválida' });

  const image = getFile(form, 'image');
  const removeImage = getString(form, 'removeImage');
  const parsed = updateTemplateSchema.safeParse({
    name: getString(form, 'name'),
    message: getString(form, 'message'),
    removeImage: removeImage === undefined ? undefined : removeImage === 'true',
  });

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  if (!image && !Object.values(parsed.data).some((value) => value !== undefined)) {
    return errorResponse({ status: 400, message: 'Debes enviar al menos un campo' });
  }

  try {
    return Response.json(await patchTemplate(id, parsed.data, image));
  } catch (error) {
    return handleDbError(error, {
      notFound: TEMPLATE_NOT_FOUND,
      fallback: 'No se pudo actualizar el template',
    });
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/templates/[id]'>) {
  const id = Number((await ctx.params).id);

  if (!Number.isInteger(id)) return errorResponse({ status: 400, message: 'Id inválido' });

  try {
    await deleteTemplate(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleDbError(error, {
      notFound: TEMPLATE_NOT_FOUND,
      fallback: 'No se pudo eliminar el template',
    });
  }
}
