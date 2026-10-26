'use client';

import type { LeadRow } from '../types';

import { createColumnHelper } from '@tanstack/react-table';

import DataTable, { dataTableFeatures } from '@/components/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '../_store';
import { Badge } from '@/components/ui/badge';
import LeadActions from './LeadActions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const MAX_VISIBLE_TAGS = 2;
const MAX_EXTRA_LABEL = 9;

const helper = createColumnHelper<typeof dataTableFeatures, LeadRow>();

const columns = helper.columns([
  helper.accessor('contactName', { header: 'Nombre' }),
  helper.accessor('enrollmentDate', {
    header: 'Captación',
    cell: ({ row }) =>
      new Date(row.original.enrollmentDate).toLocaleDateString('es', { dateStyle: 'medium' }),
  }),
  helper.accessor('phone', { header: 'Contacto' }),
  helper.accessor('tags', {
    header: 'Tags',
    cell: ({ row }) => {
      const tags = row.original.tags;
      const visible = tags.slice(0, MAX_VISIBLE_TAGS);
      const extra = tags.slice(MAX_VISIBLE_TAGS);

      if (!tags.length) return '-';

      return (
        <div className="flex items-center justify-start gap-2">
          {visible.map((tag) => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
          {extra.length > 0 && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Badge variant="outline" className="rounded-full">
                    +{Math.min(extra.length, MAX_EXTRA_LABEL)}
                  </Badge>
                }
              />
              <TooltipContent>
                <ul className="flex flex-col gap-2">
                  {extra.map((tag) => (
                    <li key={tag.id}>{tag.name}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  }),
  helper.accessor('pipelineId', {
    header: 'Pipeline',
    cell: ({ row }) => <Badge>{row.original.pipeline.name}</Badge>,
  }),
  helper.accessor('beforePipelineId', {
    header: 'Anterior Pipeline',
    cell: ({ row }) => {
      const original = row.original;
      const beforePipeline = original.beforePipeline;

      if (!beforePipeline) return '-';

      return <Badge variant="outline">{row.original.beforePipeline?.name}</Badge>;
    },
  }),
  helper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => <LeadActions lead={row.original} />,
  }),
]);

const LeadsTable = () => {
  const { data, initialLoading } = useStore((state) => state);

  if (initialLoading) return <Skeleton className="h-96 w-full rounded-lg" />;

  return <DataTable columns={columns} data={data} emptyMessage="No hay leads." />;
};

export default LeadsTable;
