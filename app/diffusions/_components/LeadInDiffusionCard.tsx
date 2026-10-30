import type { DiffusionLeadRow } from '../types';

import { IconAlertTriangle } from '@tabler/icons-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '../format';
import LeadStatusBadge from './LeadStatusBadge';

const LeadInDiffusionCard = ({ item }: { item: DiffusionLeadRow }) => (
  <article className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground">
    <header className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <h3 className="truncate font-medium">{item.lead.contactName}</h3>
        <p className="text-xs text-muted-foreground">{item.lead.phone}</p>
      </div>
      <LeadStatusBadge status={item.status} />
    </header>

    <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 text-xs">
      <dt className="text-muted-foreground">Enviado</dt>
      <dd>{formatDate(item.sentAt)}</dd>
      <dt className="text-muted-foreground">Template</dt>
      <dd>{item.template ? <Badge variant="secondary">{item.template.name}</Badge> : '-'}</dd>
    </dl>

    {item.error && (
      <Alert variant="destructive">
        <IconAlertTriangle />
        <AlertDescription>{item.error}</AlertDescription>
      </Alert>
    )}
  </article>
);

export default LeadInDiffusionCard;
