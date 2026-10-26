import type { NormalizedError } from '@/lib/types';
import type { Template } from './types';

import { Suspense } from 'react';
import { connection } from 'next/server';

import { getTemplates } from '@/server/actions/templates/get';

import { Skeleton } from '@/components/ui/skeleton';

import ErrorPage from '@/components/ErrorPage';
import Header from './_components/Header';
import Provider from './_components/Provider';
import TemplatesGrid from './_components/TemplatesGrid';

const Templates = async () => {
  await connection();

  let templates: Template[];

  try {
    templates = await getTemplates({});
  } catch (error) {
    const normalized = error as NormalizedError;

    console.error('Page error: ', normalized);

    return <ErrorPage error={normalized} />;
  }

  return (
    <Provider data={templates}>
      <div className="flex flex-col gap-4 p-4">
        <Header />
        <TemplatesGrid />
      </div>
    </Provider>
  );
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-4">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      }
    >
      <Templates />
    </Suspense>
  );
}
