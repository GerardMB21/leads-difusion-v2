'use server';

import type { Pipeline, PipelineFilters } from '@/app/pipelines/types';

import { OrderBy } from '@/lib/types';
import { db } from '@/prisma/db';

export async function getPipelines(query: PipelineFilters): Promise<Pipeline[]> {
  const { orderBy, ...rest } = query;

  return db.orm.public.Pipeline.where({
    ...rest,
    deletedAt: null,
  })
    .orderBy((p) => {
      let order = p.order.asc();

      if (orderBy == OrderBy.DESC) order = p.order.desc();

      return order;
    })
    .all();
}
