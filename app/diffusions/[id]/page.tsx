import type { NormalizedError } from '@/lib/types';
import type { DiffusionLeadRow, DiffusionRow } from '../types';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { getDiffusion, getDiffusionLeads } from '@/server/actions/diffusions/get';
import { DIFFUSION_NOT_FOUND } from '@/server/queries/diffusions';

import ErrorPage from '@/components/ErrorPage';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import BadgeList from '../_components/BadgeList';
import DiffusionStats from '../_components/DiffusionStats';
import LeadInDiffusionCard from '../_components/LeadInDiffusionCard';
import StatusBadge from '../_components/StatusBadge';
import { formatDate } from '../format';

const Detail = async ({ params }: { params: Promise<{ id: string }> }) => {
  await connection();

  const id = Number((await params).id);

  if (!Number.isInteger(id) || id < 1) notFound();

  let diffusion: DiffusionRow;
  let leads: DiffusionLeadRow[];

  try {
    [diffusion, leads] = await Promise.all([getDiffusion(id), getDiffusionLeads(id)]);
  } catch (error) {
    const normalized = error as NormalizedError;

    if (normalized.message === DIFFUSION_NOT_FOUND) notFound();

    console.error('Page error: ', normalized);

    return <ErrorPage error={normalized} />;
  }

  return (
    <>
      <header className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground">
        <div className="flex items-center gap-2">
          <h2 className="truncate font-medium">Diffusion #{diffusion.id}</h2>
          <StatusBadge status={diffusion.status} />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 shrink-0 text-muted-foreground">Pipeline</span>
          {diffusion.pipeline ? <Badge>{diffusion.pipeline.name}</Badge> : '-'}
        </div>
        <BadgeList label="Tags" items={diffusion.tags} />
        <BadgeList label="Templates" items={diffusion.templates} variant="secondary" />
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <dt className="text-muted-foreground">Inicio</dt>
          <dd>{formatDate(diffusion.startAt)}</dd>
          <dt className="text-muted-foreground">Fin</dt>
          <dd>{formatDate(diffusion.finishedAt)}</dd>
        </dl>
      </header>

      <DiffusionStats diffusion={diffusion} showPending />

      {leads.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((item) => (
            <LeadInDiffusionCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">No hay leads.</p>
      )}
    </>
  );
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}
