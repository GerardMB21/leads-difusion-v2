import 'server-only';

import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const LOGS_DIR = path.join(process.cwd(), 'logs');

export const WEBHOOK_LOG = 'webhook.log';
export const SEND_LOG = 'send.log';

export async function writeLog(file: string, entry: unknown) {
  try {
    await mkdir(LOGS_DIR, { recursive: true, mode: 0o700 });
    await appendFile(
      path.join(LOGS_DIR, file),
      `${JSON.stringify({ at: new Date().toISOString(), ...(entry as object) })}\n`,
      { mode: 0o600 },
    );
  } catch (error) {
    console.error('Log write error: ', error instanceof Error ? error.message : error);
  }
}
