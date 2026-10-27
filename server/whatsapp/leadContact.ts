import { db } from '@/prisma/db';
import type { Tx } from '@/server/workflows/moveLeads';
import { phoneCandidates } from './phone';

export async function setLastContact(
  tx: Tx,
  phone: string,
  messageId: string | null,
  contactedAt = new Date().toISOString(),
) {
  const candidates = phoneCandidates(phone);

  if (!candidates.length) return 0;

  return tx.orm.public.Lead.where((l) => l.phone.in(candidates))
    .where({ deletedAt: null })
    .updateAndCount({
      lastContact: contactedAt,
      messageResponse: false,
      ...(messageId && { lastMessageId: messageId }),
    });
}

export async function markLeadContacted(phone: string, messageId: string | null) {
  try {
    await db.transaction((tx) => setLastContact(tx, phone, messageId));
  } catch (error) {
    console.error('Lead contact error: ', error);
  }
}
