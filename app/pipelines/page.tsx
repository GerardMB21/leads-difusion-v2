import type { NormalizedError, PageProps } from '@/lib/types';
import type { Pipeline } from './types';

import { Suspense } from 'react';
import { connection } from 'next/server';

import { getPipelines } from '@/server/actions/pipelines/get';

import { Skeleton } from '@/components/ui/skeleton';
import ErrorPage from '@/components/ErrorPage';
import Header from './_components/Header';
import Kanban from './_components/Kanban';
import Provider from './_components/Provider';

const Pipelines = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  await connection();

  let pipelines: Pipeline[];

  try {
    pipelines = await getPipelines(params);
  } catch (error) {
    const normalized = error as NormalizedError;

    console.error('Page error: ', normalized);

    return <ErrorPage error={normalized} />;
  }

  return (
    <Provider data={pipelines}>
      <div className="flex h-[calc(100svh-var(--header-height))] flex-col">
        <Header />
        <Kanban />
      </div>
    </Provider>
  );
};

export default function Page(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex gap-4 p-4">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-96 w-72 shrink-0 rounded-xl" />
          ))}
        </div>
      }
    >
      <Pipelines {...props} />
    </Suspense>
  );
}
