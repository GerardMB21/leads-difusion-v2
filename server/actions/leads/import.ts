'use server';

import type { ImportLeadRow, ImportLeadsResult } from '@/app/leads/types';

import { z } from 'zod';

import { importLeadRowSchema, importLeadsSchema, type ImportLeadsInput } from '@/app/leads/schemas';
import { db } from '@/prisma/db';
import { PIPELINE_NOT_FOUND, resolveTagIds } from '@/server/queries/leads';

export async function importLeads(
  rows: ImportLeadRow[],
  input: ImportLeadsInput,
): Promise<ImportLeadsResult> {
  const { pipelineId, tagNames } = importLeadsSchema.parse(input);
  const valid = z.array(importLeadRowSchema).parse(rows);

  return db.transaction(async (tx) => {
    const pipeline = await tx.orm.public.Pipeline.where({
      id: pipelineId,
      deletedAt: null,
    }).first();

    if (!pipeline) throw new Error(PIPELINE_NOT_FOUND);

    const existing = await tx.orm.public.Lead.where((l) =>
      l.phone.in(valid.map(({ phone }) => phone)),
    )
      .where({ deletedAt: null })
      .all();

    const taken = new Set(existing.map(({ phone }) => phone));
    const skipped: ImportLeadsResult['skipped'] = [];
    const toCreate: typeof valid = [];

    for (const lead of valid) {
      if (taken.has(lead.phone)) {
        skipped.push({ row: lead.row, reason: `El teléfono ${lead.phone} ya existe` });
        continue;
      }

      taken.add(lead.phone);
      toCreate.push(lead);
    }

    if (!toCreate.length) return { created: 0, skipped };

    const last = await tx.orm.public.Lead.where({ pipelineId, deletedAt: null })
      .orderBy((l) => l.order.desc())
      .first();

    const tagIds = await resolveTagIds(tx, [], tagNames);
    let order = last ? last.order + 1 : 0;

    for (const { contactName, phone, enrollmentDate } of toCreate) {
      const lead = await tx.orm.public.Lead.create({
        contactName,
        phone,
        pipelineId,
        order: order++,
        enrollmentDate: enrollmentDate ?? new Date().toISOString(),
      });

      for (const tagId of tagIds) {
        await tx.orm.public.TagInLead.create({ tagId, leadId: lead.id });
      }
    }

    return { created: toCreate.length, skipped };
  });
}
