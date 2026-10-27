import type {
  EvolutionMessageContent,
  EvolutionMessageData,
  IncomingMessage,
  IncomingMessageType,
} from '@/app/whatsapp/types';

const STATUS_JID = 'status@broadcast';
const LID_SUFFIX = '@lid';

export function isLid(jid?: string) {
  return !!jid?.endsWith(LID_SUFFIX);
}

function toPhone(jid?: string) {
  return (jid ?? '').split('@')[0].split(':')[0].replace(/\D/g, '');
}

function toDate(timestamp?: number | string) {
  const seconds = Number(timestamp);

  if (!seconds || Number.isNaN(seconds)) return new Date();

  return new Date(seconds * 1000);
}

function resolveContent(message?: EvolutionMessageContent): {
  type: IncomingMessageType;
  text: string | null;
  media: IncomingMessage['media'];
} {
  const empty = {
    type: 'unknown' as IncomingMessageType,
    text: null,
    media: null,
  };

  if (!message) return empty;

  const document =
    message.documentMessage ?? message.documentWithCaptionMessage?.message?.documentMessage;

  const base64 = message.base64 ?? null;

  const media = (content: { url?: string; mimetype?: string; fileName?: string } = {}) => ({
    url: content.url ?? null,
    mimetype: content.mimetype ?? null,
    fileName: content.fileName ?? null,
    base64,
  });

  if (message.conversation) {
    return { type: 'text', text: message.conversation, media: null };
  }

  if (message.extendedTextMessage) {
    return {
      type: 'text',
      text: message.extendedTextMessage.text ?? null,
      media: null,
    };
  }

  if (message.imageMessage) {
    return {
      type: 'image',
      text: message.imageMessage.caption ?? null,
      media: media(message.imageMessage),
    };
  }

  if (message.videoMessage) {
    return {
      type: 'video',
      text: message.videoMessage.caption ?? null,
      media: media(message.videoMessage),
    };
  }

  if (message.audioMessage) {
    return { type: 'audio', text: null, media: media(message.audioMessage) };
  }

  if (document) {
    return {
      type: 'document',
      text: document.caption ?? null,
      media: media(document),
    };
  }

  if (message.stickerMessage) {
    return {
      type: 'sticker',
      text: null,
      media: media(message.stickerMessage),
    };
  }

  if (message.locationMessage) {
    const { name, address } = message.locationMessage;

    return {
      type: 'location',
      text: [name, address].filter(Boolean).join(' - ') || null,
      media: null,
    };
  }

  if (message.contactMessage) {
    return {
      type: 'contact',
      text: message.contactMessage.displayName ?? null,
      media: null,
    };
  }

  if (message.reactionMessage) {
    return {
      type: 'reaction',
      text: message.reactionMessage.text ?? null,
      media: null,
    };
  }

  return empty;
}

export function parseIncomingMessage(
  instance: string,
  data: EvolutionMessageData,
): IncomingMessage | null {
  if (!data?.key?.remoteJid) return null;

  const { remoteJid, remoteJidAlt, fromMe, id, participant } = data.key;
  const isGroup = remoteJid.endsWith('@g.us');
  const lid = isLid(remoteJid) ? remoteJid : null;
  const phone = lid
    ? toPhone(isLid(remoteJidAlt) ? undefined : remoteJidAlt)
    : toPhone(isGroup ? participant : remoteJid);
  const { type, text, media } = resolveContent(data.message);

  return {
    instance,
    messageId: id,
    remoteJid,
    phone,
    lid,
    pushName: data.pushName ?? null,
    fromMe: Boolean(fromMe),
    isGroup,
    isStatus: remoteJid === STATUS_JID,
    type,
    text,
    media,
    timestamp: toDate(data.messageTimestamp),
    raw: data,
  };
}
