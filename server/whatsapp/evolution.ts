import 'server-only';

import axios from 'axios';

// import { SEND_LOG, writeLog } from '../logs/fileLog';
import { htmlToWhatsApp } from './htmlToWhatsApp';
import { markLeadContacted, markLeadWithoutWhatsapp } from './leadContact';

const TYPING_MS_PER_CHAR = 60;
const MIN_TYPING_MS = 2000;
const MAX_TYPING_MS = 15_000;
const MAX_TYPING_JITTER_MS = 1500;
const REQUEST_TIMEOUT = 30_000;
const DEFAULT_COUNTRY_CODE = '51';
const LOCAL_NUMBER_LENGTH = 9;
const MIN_PHONE_LENGTH = 8;
const MAX_PHONE_LENGTH = 15;

export type EvolutionPresence = 'composing' | 'recording' | 'available' | 'unavailable' | 'paused';

export type SendTemplateMessageOptions = {
  phone: string;
  template: { name: string; message: string; img: string | null };
  wait?: (ms: number) => Promise<void>;
};

function getEvolutionConfig() {
  const prefix = process.env.EVOLUTION_API_PREFIX;
  const instance = process.env.EVOLUTION_API_INSTANCE_ID;
  const apiKey = process.env.EVOLUTION_API_KEY;

  if (!prefix || !instance || !apiKey) {
    throw new Error(
      'Evolution API no está configurada (EVOLUTION_API_PREFIX / EVOLUTION_API_INSTANCE_ID / EVOLUTION_API_KEY)',
    );
  }

  return {
    prefix: prefix.replace(/\/$/, ''),
    instance,
    headers: { apikey: apiKey },
    timeout: REQUEST_TIMEOUT,
  };
}

function describeError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return { status: error.response?.status, data: error.response?.data, message: error.message };
  }

  return error instanceof Error ? error.message : String(error);
}

function isNotOnWhatsapp(error: unknown) {
  if (error instanceof Error && error.message.startsWith('Teléfono inválido')) return true;

  return (
    axios.isAxiosError(error) &&
    error.response?.status === 400 &&
    /"exists"\s*:\s*false/.test(JSON.stringify(error.response.data ?? ''))
  );
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '').replace(/^00/, '');
  const full = digits.length === LOCAL_NUMBER_LENGTH ? `${DEFAULT_COUNTRY_CODE}${digits}` : digits;

  if (full.length < MIN_PHONE_LENGTH || full.length > MAX_PHONE_LENGTH) {
    throw new Error(`Teléfono inválido: ${phone}`);
  }

  return full;
}

export function getTypingDuration(text: string) {
  const base = text.length * TYPING_MS_PER_CHAR;
  const jitter = Math.floor(Math.random() * MAX_TYPING_JITTER_MS);

  return Math.min(Math.max(base + jitter, MIN_TYPING_MS), MAX_TYPING_MS);
}

export async function sendPresence(number: string, presence: EvolutionPresence, delay: number) {
  const { prefix, instance, ...config } = getEvolutionConfig();

  try {
    await axios.post(
      `${prefix}/chat/sendPresence/${instance}`,
      { number, presence, delay },
      config,
    );
  } catch (error) {
    console.error('WhatsApp presence error: ', describeError(error));
  }
}

export async function sendTextMessage(number: string, text: string) {
  const { prefix, instance, ...config } = getEvolutionConfig();

  const res = await axios.post(`${prefix}/message/sendText/${instance}`, { number, text }, config);

  await markLeadContacted(number, res.data?.key?.id ?? null);

  return res.data;
}

async function sendMediaByMultipart(
  number: string,
  caption: string,
  imgUrl: string,
  fileName: string,
) {
  const { prefix, instance, ...config } = getEvolutionConfig();
  const img = await fetch(imgUrl);

  if (!img.ok) throw new Error(`No se pudo descargar la imagen del template (${img.status})`);

  const mimetype = img.headers.get('content-type') ?? 'image/jpeg';
  const form = new FormData();

  form.append('number', number);
  form.append('mediatype', 'image');
  form.append('mimetype', mimetype);
  form.append('caption', caption);
  form.append('fileName', fileName);
  form.append('file', new Blob([await img.arrayBuffer()], { type: mimetype }), fileName);

  const res = await axios.post(`${prefix}/message/sendMedia/${instance}`, form, config);

  return res.data;
}

export async function sendMediaMessage(
  number: string,
  caption: string,
  imgUrl: string,
  fileName: string,
) {
  const { prefix, instance, ...config } = getEvolutionConfig();

  let data;

  try {
    const res = await axios.post(
      `${prefix}/message/sendMedia/${instance}`,
      { number, mediatype: 'image', caption, media: imgUrl, fileName },
      config,
    );

    data = res.data;
  } catch (error) {
    console.error(
      'WhatsApp sendMedia by URL failed, retrying as multipart: ',
      describeError(error),
    );

    data = await sendMediaByMultipart(number, caption, imgUrl, fileName);
  }

  await markLeadContacted(number, data?.key?.id ?? null);

  return data;
}

export async function sendTemplateMessage({
  phone,
  template,
  wait = sleep,
}: SendTemplateMessageOptions) {
  let number: string;

  try {
    number = normalizePhone(phone);
  } catch (error) {
    await markLeadWithoutWhatsapp(phone);
    throw error;
  }

  const message = htmlToWhatsApp(template.message);
  const typingMs = getTypingDuration(message);

  await sendPresence(number, 'composing', typingMs);
  await wait(typingMs);

  const extension = template.img?.split('?')[0].split('.').pop();
  let response;

  try {
    response = template.img
      ? await sendMediaMessage(number, message, template.img, `${template.name}.${extension}`)
      : await sendTextMessage(number, message);
  } catch (error) {
    if (isNotOnWhatsapp(error)) await markLeadWithoutWhatsapp(number);

    throw error;
  }

  // await writeLog(SEND_LOG, { phone: number, template: template.name, response });
  return response;
}
