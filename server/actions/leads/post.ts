'use server';

import type { Lead } from '@/app/leads/types';

import { createLeadSchema, type CreateLeadInput } from '@/app/leads/schemas';
import { db } from '@/prisma/db';
import { findLead, resolveTagIds } from '@/server/queries/leads';

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const { tagIds, tagNames, enrollmentDate, order, ...data } = createLeadSchema.parse(input);

  const id = await db.transaction(async (tx) => {
    const last =
      order === undefined
        ? await tx.orm.public.Lead.where({ pipelineId: data.pipelineId, deletedAt: null })
            .orderBy((l) => l.order.desc())
            .first()
        : null;

    const lead = await tx.orm.public.Lead.create({
      ...data,
      order: order ?? (last ? last.order + 1 : 0),
      enrollmentDate: enrollmentDate ?? new Date().toISOString(),
    });

    for (const tagId of await resolveTagIds(tx, tagIds, tagNames)) {
      await tx.orm.public.TagInLead.create({ tagId, leadId: lead.id });
    }

    return lead.id;
  });

  return (await findLead(id))!;
}
