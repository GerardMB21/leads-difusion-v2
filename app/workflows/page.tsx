import type { NormalizedError, PageProps } from '@/lib/types';
import type { PipelineOption } from './schemas';
import type { WorkflowRow } from './types';

import { Suspense } from 'react';
import { connection } from 'next/server';

import { getPipelineOptions } from '@/server/actions/pipelines/get';
import { getWorkflows } from '@/server/actions/workflows/get';

import ErrorPage from '@/components/ErrorPage';
import { Skeleton } from '@/components/ui/skeleton';
import CreateWorkflowDialog from './_components/CreateWorkflowDialog';
import Filters from './_components/Filters';
import Provider from './_components/Provider';
import WorkflowsTable from './_components/WorkflowsTable';

const Workflows = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  await connection();

  let workflows: WorkflowRow[];
  let pipelines: PipelineOption[];

  try {
    [workflows, pipelines] = await Promise.all([getWorkflows(params), getPipelineOptions()]);
  } catch (error) {
    const normalized = error as NormalizedError;

    console.error('Page error: ', normalized);

    return <ErrorPage error={normalized} />;
  }

  return (
    <Provider data={workflows} pipelines={pipelines}>
      <WorkflowsTable />
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
        <CreateWorkflowDialog />
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <Workflows {...props} />
      </Suspense>
    </div>
  );
}
