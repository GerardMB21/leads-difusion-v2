import { z } from 'zod';

import { createTemplateSchema, templateFiltersSchema } from '@/app/templates/schemas';
import { getFile, getString } from '@/lib/formData';
import { errorResponse, handleDbError } from '@/lib/response';
import { getTemplates } from '@/server/actions/templates/get';
import { createTemplate } from '@/server/actions/templates/post';
import { TEMPLATE_NOT_FOUND } from '@/server/queries/templates';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = templateFiltersSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await getTemplates(parsed.data));
  } catch (error) {
    return handleDbError(error, {
      notFound: TEMPLATE_NOT_FOUND,
      fallback: 'No se pudieron obtener los templates',
    });
  }
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);

  if (!form) return errorResponse({ status: 400, message: 'Solicitud inválida' });

  const parsed = createTemplateSchema.safeParse({
    name: getString(form, 'name'),
    message: getString(form, 'message'),
  });

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await createTemplate(parsed.data, getFile(form, 'image')), {
      status: 201,
    });
  } catch (error) {
    return handleDbError(error, {
      notFound: TEMPLATE_NOT_FOUND,
      fallback: 'No se pudo crear el template',
    });
  }
}
