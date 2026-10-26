import type { DiffusionStatus } from '../types';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DIFFUSION_STATUSES } from '../schemas';

const STYLES: Record<DiffusionStatus, string> = {
  active: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  sending: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  completed: 'bg-green-500/15 text-green-700 dark:text-green-300',
  cancelled: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  failed: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

const StatusBadge = ({ status }: { status: DiffusionStatus }) => (
  <Badge variant="secondary" className={cn(STYLES[status])}>
    {DIFFUSION_STATUSES.find(({ value }) => value === status)?.label ?? status}
  </Badge>
);

export default StatusBadge;
