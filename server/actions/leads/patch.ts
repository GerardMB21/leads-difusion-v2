'use server';

import type { Lead } from '@/app/leads/types';

import { updateLeadSchema, type UpdateLeadInput } from '@/app/leads/schemas';
import { db } from '@/prisma/db';
import { findLead, LEAD_NOT_FOUND } from '@/server/queries/leads';

export async function patchLead(id: number, input: UpdateLeadInput): Promise<Lead> {
  const { tagIds, ...data } = updateLeadSchema.parse(input);

  await db.transaction(async (tx) => {
    const lead = await tx.orm.public.Lead.where({ id, deletedAt: null }).first();

    if (!lead) throw new Error(LEAD_NOT_FOUND);

    if (Object.keys(data).length > 0) {
      await tx.orm.public.Lead.where({ id }).update(data);
    }

    if (tagIds) {
      await tx.orm.public.TagInLead.where({ leadId: id }).deleteAll();

      for (const tagId of new Set(tagIds)) {
        await tx.orm.public.TagInLead.create({ tagId, leadId: id });
      }
    }
  });

  return (await findLead(id))!;
}
