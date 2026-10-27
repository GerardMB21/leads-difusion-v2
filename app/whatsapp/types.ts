export type EvolutionWebhookEvent =
  | 'messages.upsert'
  | 'messages.update'
  | 'messages.delete'
  | 'send.message'
  | 'connection.update'
  | 'contacts.upsert'
  | 'contacts.update'
  | 'chats.upsert'
  | 'chats.update'
  | 'chats.delete'
  | 'presence.update'
  | 'qrcode.updated'
  | (string & {});

export type EvolutionMessageKey = {
  remoteJid: string;
  fromMe: boolean;
  id: string;
  participant?: string;
  remoteJidAlt?: string;
};

export type EvolutionMessageContent = {
  conversation?: string;
  extendedTextMessage?: { text?: string };
  imageMessage?: { caption?: string; mimetype?: string; url?: string };
  videoMessage?: { caption?: string; mimetype?: string; url?: string };
  audioMessage?: { mimetype?: string; url?: string; seconds?: number };
  documentMessage?: {
    caption?: string;
    mimetype?: string;
    url?: string;
    fileName?: string;
  };
  documentWithCaptionMessage?: {
    message?: {
      documentMessage?: EvolutionMessageContent['documentMessage'];
    };
  };
  stickerMessage?: { mimetype?: string; url?: string };
  locationMessage?: {
    degreesLatitude?: number;
    degreesLongitude?: number;
    name?: string;
    address?: string;
  };
  contactMessage?: { displayName?: string; vcard?: string };
  reactionMessage?: { text?: string; key?: EvolutionMessageKey };
  base64?: string;
  [key: string]: unknown;
};

export type EvolutionMessageData = {
  key: EvolutionMessageKey;
  pushName?: string;
  message?: EvolutionMessageContent;
  messageType?: string;
  messageTimestamp?: number | string;
  instanceId?: string;
  source?: string;
  status?: string;
  [key: string]: unknown;
};

export type EvolutionWebhookPayload<Data = unknown> = {
  event: EvolutionWebhookEvent;
  instance: string;
  data: Data;
  destination?: string;
  date_time?: string;
  sender?: string;
  server_url?: string;
  apikey?: string;
};

export type EvolutionMessageUpdate = {
  keyId?: string;
  remoteJid?: string;
  fromMe?: boolean;
  status?: string;
  messageId?: string;
};

export type IncomingMessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contact'
  | 'reaction'
  | 'unknown';

export type IncomingMessage = {
  instance: string;
  messageId: string;
  remoteJid: string;
  phone: string;
  lid: string | null;
  pushName: string | null;
  fromMe: boolean;
  isGroup: boolean;
  isStatus: boolean;
  type: IncomingMessageType;
  text: string | null;
  media: {
    url: string | null;
    mimetype: string | null;
    fileName: string | null;
    base64: string | null;
  } | null;
  timestamp: Date;
  raw: EvolutionMessageData;
};
