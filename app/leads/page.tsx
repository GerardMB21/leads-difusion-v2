import type { NormalizedError, PageProps } from '@/lib/types';
import type { LeadRow } from './types';

import { Suspense } from 'react';
import { connection } from 'next/server';

import { getLeads } from '@/server/actions/leads/get';

import ErrorPage from '@/components/ErrorPage';
import { Skeleton } from '@/components/ui/skeleton';
import LeadsTable from './_components/LeadsTable';
import Provider from './_components/Provider';

const Leads = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  await connection();

  let leads: LeadRow[];

  try {
    leads = await getLeads(params);
  } catch (error) {
    const normalized = error as NormalizedError;

    console.error('Page error: ', normalized);

    return <ErrorPage error={normalized} />;
  }

  return (
    <Provider data={leads}>
      <div className="p-4">
        <LeadsTable />
      </div>
    </Provider>
  );
};

export default function Page(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-4">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      }
    >
      <Leads {...props} />
    </Suspense>
  );
}
