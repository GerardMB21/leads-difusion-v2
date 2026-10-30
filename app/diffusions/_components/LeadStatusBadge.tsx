import type { LeadInDiffusionStatus } from '../types';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const LABELS: Record<LeadInDiffusionStatus, string> = {
  pending: 'Pendiente',
  sending: 'Enviando',
  sent: 'Enviado',
  failed: 'Fallido',
};

const STYLES: Record<LeadInDiffusionStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  sending: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  sent: 'bg-green-500/15 text-green-700 dark:text-green-300',
  failed: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

const LeadStatusBadge = ({ status }: { status: LeadInDiffusionStatus }) => (
  <Badge variant="secondary" className={cn(STYLES[status])}>
    {LABELS[status]}
  </Badge>
);

export default LeadStatusBadge;
