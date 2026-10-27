import { db } from '@/prisma/db';
import type { Tx } from '@/server/workflows/moveLeads';
import { phoneCandidates } from './phone';

export async function setLastContact(
  tx: Tx,
  phone: string,
  contactedAt = new Date().toISOString(),
) {
  const candidates = phoneCandidates(phone);

  if (!candidates.length) return 0;

  return tx.orm.public.Lead.where((l) => l.phone.in(candidates))
    .where({ deletedAt: null })
    .updateAndCount({ lastContact: contactedAt, messageResponse: false });
}

export async function markLeadContacted(phone: string) {
  try {
    await db.transaction((tx) => setLastContact(tx, phone));
  } catch (error) {
    console.error('Lead contact error: ', error);
  }
}
