import type { NormalizedError, PageProps } from '@/lib/types';
import type { Pipeline } from './types';

import { getPipelines } from '@/server/actions/pipelines/get';

import ErrorPage from '@/components/ErrorPage';
import Header from './_components/Header';
import Kanban from './_components/Kanban';
import Provider from './_components/Provider';

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

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
}
