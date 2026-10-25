'use server';

import type { Lead } from '@/app/leads/types';

import { leadFiltersSchema, type LeadFilters } from '@/app/leads/schemas';
import { OrderBy } from '@/lib/types';
import { db } from '@/prisma/db';
import { toLead } from '@/server/queries/leads';

export async function getLeads(query: LeadFilters): Promise<Lead[]> {
  const { orderBy, ...filters } = leadFiltersSchema.parse(query);

  const leads = await db.orm.public.Lead.where({ ...filters, deletedAt: null })
    .orderBy((l) => (orderBy === OrderBy.DESC ? l.order.desc() : l.order.asc()))
    .include('tags', (tags) => tags.include('tag'))
    .all();

  return leads.map(toLead);
}
