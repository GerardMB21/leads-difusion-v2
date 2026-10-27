import type { EvolutionWebhookPayload } from '@/app/whatsapp/types';

import { errorResponse } from '@/lib/response';
import { handleWebhookEvent } from '@/server/whatsapp/handleWebhookEvent';

export async function POST(req: Request) {
  const payload: EvolutionWebhookPayload | null = await req.json().catch(() => null);

  if (!payload || typeof payload !== 'object') {
    return errorResponse({ status: 400, message: 'Cuerpo JSON inválido' });
  }

  try {
    await handleWebhookEvent(payload);

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Webhook error: ', error);

    return errorResponse({ status: 500, message: 'No se pudo procesar el evento' });
  }
}

export async function GET() {
  return Response.json({ ok: true, service: 'whatsapp-webhook' });
}
