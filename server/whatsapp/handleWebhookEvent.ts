import type {
  EvolutionMessageData,
  EvolutionMessageUpdate,
  EvolutionWebhookPayload,
} from '@/app/whatsapp/types';
import type { IncomingMessageResult } from './onIncomingMessage';

// import { WEBHOOK_LOG, writeLog } from '../logs/fileLog';
import { db } from '@/prisma/db';
import { onIncomingMessage } from './onIncomingMessage';
import { isLid, parseIncomingMessage } from './parseIncomingMessage';

export type WebhookEventResult = {
  event: string;
  processed: number;
  ignored: number;
  results: IncomingMessageResult[];
};

function toArray(data: unknown): EvolutionMessageData[] {
  if (!data) return [];

  return (Array.isArray(data) ? data : [data]) as EvolutionMessageData[];
}

async function handleMessagesUpsert(payload: EvolutionWebhookPayload) {
  const results: IncomingMessageResult[] = [];

  let ignored = 0;

  for (const data of toArray(payload.data)) {
    const message = parseIncomingMessage(payload.instance, data);

    if (
      !message ||
      message.fromMe ||
      message.isStatus ||
      message.isGroup ||
      (!message.phone && !message.lid)
    ) {
      ignored++;
      continue;
    }

    results.push(await onIncomingMessage(message));
  }

  return { processed: results.length, ignored, results };
}

async function handleMessagesUpdate(payload: EvolutionWebhookPayload) {
  let processed = 0;
  let ignored = 0;

  for (const data of toArray(payload.data) as unknown as EvolutionMessageUpdate[]) {
    if (!data?.fromMe || !data.keyId || !isLid(data.remoteJid)) {
      ignored++;
      continue;
    }

    const linked = await db.orm.public.Lead.where({
      lastMessageId: data.keyId,
      lid: null,
      deletedAt: null,
    }).updateAndCount({ lid: data.remoteJid });

    if (linked) processed++;
    else ignored++;
  }

  return { processed, ignored, results: [] as IncomingMessageResult[] };
}

export async function handleWebhookEvent(
  payload: EvolutionWebhookPayload,
): Promise<WebhookEventResult> {
  const event = payload.event ?? 'unknown';

  // await writeLog(WEBHOOK_LOG, { event, payload: { ...payload, apikey: undefined } });

  if (event === 'messages.upsert') {
    return { event, ...(await handleMessagesUpsert(payload)) };
  }

  if (event === 'messages.update') {
    return { event, ...(await handleMessagesUpdate(payload)) };
  }

  return { event, processed: 0, ignored: toArray(payload.data).length, results: [] };
}
