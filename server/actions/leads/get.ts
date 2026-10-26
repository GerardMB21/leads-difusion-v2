'use server';

import type { LeadRow } from '@/app/leads/types';

import { or } from '@prisma/orm-postgres/orm-client';

import { leadFiltersSchema, type LeadFilters } from '@/app/leads/schemas';
import { OrderBy } from '@/lib/types';
import { db } from '@/prisma/db';
import { toLead } from '@/server/queries/leads';

const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');

export async function getLeads(query: LeadFilters): Promise<LeadRow[]> {
  const { orderBy, search, tagIds, ...filters } = leadFiltersSchema.parse(query);

  let leadsQuery = db.orm.public.Lead.where({ ...filters, deletedAt: null });

  if (search) {
    const pattern = `%${escapeLike(search)}%`;

    leadsQuery = leadsQuery.where((l) => or(l.contactName.ilike(pattern), l.phone.ilike(pattern)));
  }

  for (const tagId of new Set(tagIds)) {
    leadsQuery = leadsQuery.where((l) => l.tags.some((t) => t.tagId.eq(tagId)));
  }

  const leads = await leadsQuery
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
