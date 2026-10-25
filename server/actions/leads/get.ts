'use server';

import type { LeadRow } from '@/app/leads/types';

import { leadFiltersSchema, type LeadFilters } from '@/app/leads/schemas';
import { OrderBy } from '@/lib/types';
import { db } from '@/prisma/db';
import { toLead } from '@/server/queries/leads';

export async function getLeads(query: LeadFilters): Promise<LeadRow[]> {
  const { orderBy, ...filters } = leadFiltersSchema.parse(query);

  const leads = await db.orm.public.Lead.where({ ...filters, deletedAt: null })
    .orderBy((l) => (orderBy === OrderBy.DESC ? l.order.desc() : l.order.asc()))
    .include('tags', (tags) => tags.include('tag'))
    .include('pipeline')
    .include('beforePipeline')
    .all();

  return leads.map(({ pipeline, beforePipeline, ...lead }) => ({
    ...toLead(lead),
    pipeline: { id: pipeline.id, name: pipeline.name },
    beforePipeline: beforePipeline ? { id: beforePipeline.id, name: beforePipeline.name } : null,
  }));
}
