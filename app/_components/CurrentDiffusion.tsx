'use client';

import type { DiffusionRow } from '@/app/diffusions/types';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconSend } from '@tabler/icons-react';

import BadgeList from '@/app/diffusions/_components/BadgeList';
import CancelDiffusionButton from '@/app/diffusions/_components/CancelDiffusionButton';
import StatusBadge from '@/app/diffusions/_components/StatusBadge';
import { formatDate } from '@/app/diffusions/format';
import { isCancellable } from '@/app/diffusions/schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STREAM_URL = '/api/diffusions/stream';

const formatCountdown = (ms: number) => {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);

  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};

const Stat = ({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={cn('text-2xl font-semibold', className)}>{value}</span>
  </div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="text-sm">{children}</dd>
  </div>
);

const CurrentDiffusion = ({ initial }: { initial: DiffusionRow | null }) => {
  const [diffusion, setDiffusion] = useState(initial);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const source = new EventSource(STREAM_URL);

    source.onmessage = (event) => setDiffusion(JSON.parse(event.data) as DiffusionRow | null);

    return () => source.close();
  }, []);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);

    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const toolbar = (
    <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/diffusions" />}>
      <IconSend />
      Diffusions
    </Button>
  );

  if (!diffusion) {
    return (
      <article className="flex flex-col gap-3 rounded-xl border bg-card p-6 text-card-foreground">
        <header className="flex items-center justify-between gap-2">
          <h3 className="font-medium">No hay diffusions en curso ni pendientes</h3>
          {toolbar}
        </header>
        <p className="text-sm text-muted-foreground">
          Crea una diffusion para verla aquí en tiempo real.
        </p>
      </article>
    );
  }

  const { status, nextSendAt } = diffusion;
  const waiting = nextSendAt && now !== null ? Date.parse(nextSendAt) - now : null;

  return (
    <article className="flex flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-lg font-medium">Diffusion #{diffusion.id}</h3>
          <StatusBadge status={status} />
          {status === 'pending' && <Badge variant="outline">Próxima en la cola</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {isCancellable(status) && <CancelDiffusionButton diffusion={diffusion} />}
          {toolbar}
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3 md:divide-x">
        <dl className="flex flex-col gap-4">
          <Row label="Inicio">
            {diffusion.startAt ? formatDate(diffusion.startAt) : 'Cuando sea su turno'}
          </Row>
          <Row label="Siguiente envío">
            {status === 'sending' ? (
              'Enviando ahora...'
            ) : nextSendAt ? (
              <span className="flex items-baseline gap-2">
                {formatDate(nextSendAt)}
                {waiting !== null && waiting > 0 && (
                  <span className="text-xs text-muted-foreground">
                    en {formatCountdown(waiting)}
                  </span>
                )}
              </span>
            ) : (
              '-'
            )}
          </Row>
        </dl>

        <div className="flex flex-wrap items-center justify-evenly gap-4 md:px-6">
          <Stat label="Total" value={diffusion.total} />
          <Stat
            label="Procesados"
            value={diffusion.processed}
            className="text-orange-600 dark:text-orange-400"
          />
          <Stat label="Por procesar" value={diffusion.total - diffusion.processed} />
          <Stat
            label="Enviados"
            value={diffusion.sent}
            className="text-green-600 dark:text-green-400"
          />
          <Stat
            label="Fallidos"
            value={diffusion.failed}
            className="text-red-600 dark:text-red-400"
          />
        </div>

        <div className="flex flex-col gap-3 md:pl-6">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-16 shrink-0 text-muted-foreground">Pipeline</span>
            {diffusion.pipeline ? <Badge>{diffusion.pipeline.name}</Badge> : '-'}
          </div>
          <BadgeList label="Tags" items={diffusion.tags} />
          <BadgeList label="Templates" items={diffusion.templates} variant="secondary" />
        </div>
      </div>
    </article>
  );
};

export default CurrentDiffusion;
