'use server';

import type { DiffusionRow, DiffusionStatus } from '@/app/diffusions/types';

import { diffusionFiltersSchema, type DiffusionFilters } from '@/app/diffusions/schemas';
import { OrderBy } from '@/lib/types';
import { db } from '@/prisma/db';
import { DIFFUSION_NOT_FOUND, emptyStats, getDiffusionStats } from '@/server/queries/diffusions';

export async function getDiffusions(query: DiffusionFilters = {}): Promise<DiffusionRow[]> {
  const { orderBy, ...filters } = diffusionFiltersSchema.parse(query);

  const diffusions = await db.orm.public.Diffusion.where({ ...filters, deletedAt: null })
    .orderBy((d) => (orderBy === OrderBy.ASC ? d.createdAt.asc() : d.createdAt.desc()))
    .include('pipeline')
    .include('tags', (tags) => tags.include('tag'))
    .include('templates', (templates) => templates.include('template'))
    .all();

  const stats = await getDiffusionStats(diffusions.map(({ id }) => id));

  return diffusions.map(({ pipeline, tags, templates, ...diffusion }) => ({
    ...diffusion,
    ...(stats.get(diffusion.id) ?? emptyStats()),
    status: diffusion.status as DiffusionStatus,
    pipeline: pipeline ? { id: pipeline.id, name: pipeline.name } : null,
    tags: tags.map(({ tag }) => ({ id: tag.id, name: tag.name })),
    templates: templates.map(({ template }) => ({ id: template.id, name: template.name })),
  }));
}

export async function getDiffusion(id: number): Promise<DiffusionRow> {
  const [diffusion] = await getDiffusions({ id });

  if (!diffusion) throw new Error(DIFFUSION_NOT_FOUND);

  return diffusion;
}
