import type { DiffusionRow } from '../types';

import Link from 'next/link';

import { IconAlertTriangle } from '@tabler/icons-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '../format';
import { isCancellable, isResumable, isStoppable } from '../schemas';
import BadgeList from './BadgeList';
import CancelDiffusionButton from './CancelDiffusionButton';
import DiffusionStats from './DiffusionStats';
import ResumeDiffusionButton from './ResumeDiffusionButton';
import StatusBadge from './StatusBadge';
import StopDiffusionButton from './StopDiffusionButton';

const DiffusionCard = ({ diffusion }: { diffusion: DiffusionRow }) => (
  <article className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground">
    <header className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <h3 className="truncate font-medium">
          <Link href={`/diffusions/${diffusion.id}`} className="hover:underline">
            Diffusion #{diffusion.id}
          </Link>
        </h3>
        <StatusBadge status={diffusion.status} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {isResumable(diffusion.status) && <ResumeDiffusionButton diffusion={diffusion} />}
        {isStoppable(diffusion.status) && <StopDiffusionButton diffusion={diffusion} />}
        {isCancellable(diffusion.status) && <CancelDiffusionButton diffusion={diffusion} />}
      </div>
    </header>

    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 shrink-0 text-muted-foreground">Pipeline</span>
      {diffusion.pipeline ? <Badge>{diffusion.pipeline.name}</Badge> : '-'}
    </div>
    <BadgeList label="Tags" items={diffusion.tags} />
    <BadgeList label="Templates" items={diffusion.templates} variant="secondary" />

    <DiffusionStats diffusion={diffusion} />

    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
      <dt className="text-muted-foreground">Inicio</dt>
      <dd>{formatDate(diffusion.startAt)}</dd>
      <dt className="text-muted-foreground">Fin</dt>
      <dd>{formatDate(diffusion.finishedAt)}</dd>
      <dt className="text-muted-foreground">Anterior envío</dt>
      <dd>{formatDate(diffusion.beforeSendAt)}</dd>
      <dt className="text-muted-foreground">Próximo envío</dt>
      <dd>{formatDate(diffusion.nextSendAt)}</dd>
      {diffusion.status === 'stopped' && (
        <>
          <dt className="text-muted-foreground">Detenida</dt>
          <dd>{formatDate(diffusion.stoppedAt)}</dd>
        </>
      )}
    </dl>

    {diffusion.error && (
      <Alert variant="destructive">
        <IconAlertTriangle />
        <AlertDescription>{diffusion.error}</AlertDescription>
      </Alert>
    )}
  </article>
);

export default DiffusionCard;
