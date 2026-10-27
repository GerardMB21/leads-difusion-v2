'use server';

import type { DiffusionRow } from '@/app/diffusions/types';

import { createDiffusionSchema, type CreateDiffusionInput } from '@/app/diffusions/schemas';
import { db } from '@/prisma/db';
import { INVALID_REFERENCES } from '@/server/queries/diffusions';
import { publishDiffusionChange } from '@/server/diffusions/events';
import { getDiffusion } from './get';

export async function createDiffusion(input: CreateDiffusionInput): Promise<DiffusionRow> {
  const { pipelineId, tagIds, templateIds, leadIds, startAt } = createDiffusionSchema.parse(input);

  const unique = {
    tagIds: [...new Set(tagIds)],
    templateIds: [...new Set(templateIds)],
    leadIds: [...new Set(leadIds)],
  };

  const id = await db.transaction(async (tx) => {
    if (pipelineId) {
      const pipeline = await tx.orm.public.Pipeline.where({
        id: pipelineId,
        deletedAt: null,
      }).first();

      if (!pipeline) throw new Error(INVALID_REFERENCES);
    }

    const [leads, templates, tags] = await Promise.all([
      tx.orm.public.Lead.where((l) => l.id.in(unique.leadIds))
        .where({ deletedAt: null })
        .all(),
      tx.orm.public.Template.where((t) => t.id.in(unique.templateIds))
        .where({ deletedAt: null })
        .all(),
      unique.tagIds.length
        ? tx.orm.public.Tag.where((t) => t.id.in(unique.tagIds))
            .where({ deletedAt: null })
            .all()
        : [],
    ]);

    if (
      leads.length !== unique.leadIds.length ||
      templates.length !== unique.templateIds.length ||
      tags.length !== unique.tagIds.length
    ) {
      throw new Error(INVALID_REFERENCES);
    }

    const diffusion = await tx.orm.public.Diffusion.create({
      pipelineId: pipelineId ?? null,
      total: unique.leadIds.length,
      startAt: startAt ?? null,
    });

    const diffusionId = diffusion.id;

    if (unique.tagIds.length) {
      await tx.orm.public.TagInDiffusion.createAll(
        unique.tagIds.map((tagId) => ({ tagId, diffusionId })),
      );
    }

    await tx.orm.public.TemplateInDiffusion.createAll(
      unique.templateIds.map((templateId) => ({ templateId, diffusionId })),
    );
    await tx.orm.public.LeadInDiffusion.createAll(
      unique.leadIds.map((leadId) => ({ leadId, diffusionId })),
    );

    return diffusion.id;
  });

  publishDiffusionChange();

  return getDiffusion(id);
}
