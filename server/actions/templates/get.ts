'use server';

import type { Template } from '@/app/templates/types';

import { templateFiltersSchema, type TemplateFilters } from '@/app/templates/schemas';
import { OrderBy } from '@/lib/types';
import { db } from '@/prisma/db';
import { TEMPLATE_NOT_FOUND } from '@/server/queries/templates';

export async function getTemplates(query: TemplateFilters = {}): Promise<Template[]> {
  const { orderBy, ...filters } = templateFiltersSchema.parse(query);

  return db.orm.public.Template.where({ ...filters, deletedAt: null })
    .orderBy((t) => (orderBy === OrderBy.ASC ? t.createdAt.asc() : t.createdAt.desc()))
    .all();
}

export async function getTemplate(id: number): Promise<Template> {
  const template = await db.orm.public.Template.where({ id, deletedAt: null }).first();

  if (!template) throw new Error(TEMPLATE_NOT_FOUND);

  return template;
}
