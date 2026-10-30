import type { DiffusionRow } from '../types';

import { Separator } from '@/components/ui/separator';

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

const DiffusionStats = ({
  diffusion,
  showPending,
}: {
  diffusion: DiffusionRow;
  showPending?: boolean;
}) => (
  <div className="flex items-center justify-evenly gap-2 rounded-lg bg-muted/50 px-2 py-2">
    <Stat label="Total" value={diffusion.total} className="text-base font-bold" />
    <Separator orientation="vertical" />
    <Stat
      label="Procesados"
      value={diffusion.processed}
      className="text-sm font-medium text-orange-600 dark:text-orange-400"
    />
    {showPending && (
      <>
        <Separator orientation="vertical" />
        <Stat
          label="Pendientes"
          value={diffusion.total - diffusion.processed}
          className="text-sm font-medium"
        />
      </>
    )}
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
);

export default DiffusionStats;
