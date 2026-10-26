import { z } from 'zod';

import { sendTemplateSchema } from '@/app/whatsapp/schemas';
import { errorResponse, handleDbError } from '@/lib/response';
import { sendTemplate } from '@/server/actions/whatsapp/sendTemplate';
import { TEMPLATE_NOT_FOUND } from '@/server/queries/templates';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = sendTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    await sendTemplate(parsed.data);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Teléfono inválido')) {
      return errorResponse({ status: 400, message: error.message });
    }

    return handleDbError(error, {
      notFound: TEMPLATE_NOT_FOUND,
      fallback: 'No se pudo enviar el mensaje',
    });
  }
}
