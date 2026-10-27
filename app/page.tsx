import type { DiffusionRow } from '@/app/diffusions/types';
import type { NormalizedError } from '@/lib/types';

import { Suspense } from 'react';
import { connection } from 'next/server';

import ErrorPage from '@/components/ErrorPage';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentDiffusion } from '@/server/actions/diffusions/get';
import CurrentDiffusion from './_components/CurrentDiffusion';

const Current = async () => {
  await connection();

  let diffusion: DiffusionRow | null;

  try {
    diffusion = await getCurrentDiffusion();
  } catch (error) {
    const normalized = error as NormalizedError;

    console.error('Page error: ', normalized);

    return <ErrorPage error={normalized} />;
  }

  return <CurrentDiffusion initial={diffusion} />;
};

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Suspense fallback={<Skeleton className="h-56 w-full rounded-xl" />}>
        <Current />
      </Suspense>
    </div>
  );
}
