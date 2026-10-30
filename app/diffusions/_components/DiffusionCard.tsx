import type { DiffusionRow } from '../types';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '../format';
import { isCancellable, isResumable, isStoppable } from '../schemas';
import BadgeList from './BadgeList';
import CancelDiffusionButton from './CancelDiffusionButton';
import ResumeDiffusionButton from './ResumeDiffusionButton';
import StatusBadge from './StatusBadge';
import StopDiffusionButton from './StopDiffusionButton';

const Stat = ({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) => (
  <span className={`flex items-baseline gap-1 whitespace-nowrap ${className ?? ''}`}>
    <span className="text-xs">{label}</span>
    <span>{value}</span>
  </span>
);

const DiffusionCard = ({ diffusion }: { diffusion: DiffusionRow }) => (
  <article className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground">
    <header className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <h3 className="truncate font-medium">Diffusion #{diffusion.id}</h3>
        <StatusBadge status={diffusion.status} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {isResumable(diffusion.status) && <ResumeDiffusionButton diffusion={diffusion} />}
        {isStoppable(diffusion.status) && <StopDiffusionButton diffusion={diffusion} />}
        {isCancellable(diffusion.status) && <CancelDiffusionButton diffusion={diffusion} />}
      </div>
    </header>

    {diffusion.error && (
      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {diffusion.error}
      </p>
    )}

    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 shrink-0 text-muted-foreground">Pipeline</span>
      {diffusion.pipeline ? <Badge>{diffusion.pipeline.name}</Badge> : '-'}
    </div>
    <BadgeList label="Tags" items={diffusion.tags} />
    <BadgeList label="Templates" items={diffusion.templates} variant="secondary" />

    <div className="flex items-center justify-evenly gap-2 rounded-lg bg-muted/50 px-2 py-2">
      <Stat label="Total" value={diffusion.total} className="text-base font-bold" />
      <Separator orientation="vertical" />
      <Stat
        label="Procesados"
        value={diffusion.processed}
        className="text-sm font-medium text-orange-600 dark:text-orange-400"
      />
      <Separator orientation="vertical" />
      <Stat
        label="Enviados"
        value={diffusion.sent}
        className="text-sm font-medium text-green-600 dark:text-green-400"
      />
      <Separator orientation="vertical" />
      <Stat
        label="Fallidos"
        value={diffusion.failed}
        className="text-sm font-medium text-red-600 dark:text-red-400"
      />
    </div>

    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
      <dt className="text-muted-foreground">Inicio</dt>
      <dd>{formatDate(diffusion.startAt)}</dd>
      <dt className="text-muted-foreground">Fin</dt>
      <dd>{formatDate(diffusion.finishedAt)}</dd>
      <dt className="text-muted-foreground">Próximo envío</dt>
      <dd>{formatDate(diffusion.nextSendAt)}</dd>
    </dl>
  </article>
);

export default DiffusionCard;
