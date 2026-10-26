import type { NormalizedError, PageProps } from '@/lib/types';
import type { State } from './_store';
import type { DiffusionRow } from './types';

import { Suspense } from 'react';
import { connection } from 'next/server';

import { getDiffusions } from '@/server/actions/diffusions/get';
import { getPipelineOptions } from '@/server/actions/pipelines/get';
import { getTags } from '@/server/actions/tags/get';
import { getTemplates } from '@/server/actions/templates/get';

import ErrorPage from '@/components/ErrorPage';
import { Skeleton } from '@/components/ui/skeleton';
import { parseStatus } from './schemas';
import CreateDiffusionDialog from './_components/CreateDiffusionDialog';
import DiffusionsGrid from './_components/DiffusionsGrid';
import Filters from './_components/Filters';
import Provider from './_components/Provider';

const Diffusions = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  await connection();

  let diffusions: DiffusionRow[];
  let options: Pick<State, 'pipelines' | 'tags' | 'templates'>;

  try {
    const [rows, pipelines, tags, templates] = await Promise.all([
      getDiffusions({ ...params, status: parseStatus(params.status) }),
      getPipelineOptions(),
      getTags(),
      getTemplates({}),
    ]);

    diffusions = rows;
    options = {
      pipelines,
      tags,
      templates: templates.map(({ id, name }) => ({ id, name })),
    };
  } catch (error) {
    const normalized = error as NormalizedError;

    console.error('Page error: ', normalized);

    return <ErrorPage error={normalized} />;
  }

  return (
    <Provider data={diffusions} options={options}>
      <DiffusionsGrid />
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
        <CreateDiffusionDialog />
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <Diffusions {...props} />
      </Suspense>
    </div>
  );
}
