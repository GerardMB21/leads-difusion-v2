import type { NormalizedError, PageProps } from '@/lib/types';
import type { State } from './_store';
import type { LeadRow } from './types';

import { Suspense } from 'react';
import { connection } from 'next/server';

import { getLeads } from '@/server/actions/leads/get';
import { getPipelineOptions } from '@/server/actions/pipelines/get';
import { getTags } from '@/server/actions/tags/get';

import ErrorPage from '@/components/ErrorPage';
import ImportLeadsDialog from '@/components/ImportLeadsDialog';
import { Skeleton } from '@/components/ui/skeleton';
import CreateLeadDialog from './_components/CreateLeadDialog';
import Filters from './_components/Filters';
import LeadsTable from './_components/LeadsTable';
import Provider from './_components/Provider';

const Leads = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  await connection();

  let leads: LeadRow[];
  let options: Pick<State, 'pipelines' | 'tags'>;

  try {
    const [rows, pipelines, tags] = await Promise.all([
      getLeads(params),
      getPipelineOptions(),
      getTags(),
    ]);

    leads = rows;
    options = { pipelines, tags };
  } catch (error) {
    const normalized = error as NormalizedError;

    console.error('Page error: ', normalized);

    return <ErrorPage error={normalized} />;
  }

  return (
    <Provider data={leads} options={options}>
      <LeadsTable />
    </Provider>
  );
};

export default function Page(props: PageProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Suspense fallback={null}>
          <Filters />
        </Suspense>
        <div className="flex items-center gap-2">
          <ImportLeadsDialog />
          <CreateLeadDialog />
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <Leads {...props} />
      </Suspense>
    </div>
  );
}
