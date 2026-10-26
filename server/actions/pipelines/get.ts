'use server';

import type { Pipeline, PipelineFilters } from '@/app/pipelines/types';

import { OrderBy } from '@/lib/types';
import { db } from '@/prisma/db';

export async function getPipelines(query: PipelineFilters): Promise<Pipeline[]> {
  const { orderBy, ...rest } = query;

  const pipelines = await db.orm.public.Pipeline.where({
    ...rest,
    deletedAt: null,
  })
    .orderBy((p) => {
      let order = p.order.asc();

      if (orderBy == OrderBy.DESC) order = p.order.desc();

      return order;
    })
    .include('leads', (leads) =>
      leads
        .where((l) => l.deletedAt.isNull())
        .orderBy((l) => l.order.asc())
        .include('tags', (tags) => tags.include('tag')),
    )
    .all();

  return pipelines.map((pipeline) => ({
    ...pipeline,
    leads: pipeline.leads.map((lead) => ({
      ...lead,
      tags: lead.tags.map(({ tag }) => ({ id: tag.id, name: tag.name })),
    })),
  }));
}

export async function getPipelineOptions(): Promise<{ id: number; name: string }[]> {
  const pipelines = await db.orm.public.Pipeline.where({ deletedAt: null })
    .orderBy((p) => p.order.asc())
    .all();

  return pipelines.map(({ id, name }) => ({ id, name }));
}
