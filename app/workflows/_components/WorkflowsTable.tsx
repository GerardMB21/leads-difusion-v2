'use client';

import type { WorkflowRow } from '../types';

import { createColumnHelper } from '@tanstack/react-table';

import DataTable, { dataTableFeatures } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '../_store';
import { triggerOf } from '../schemas';
import WorkflowActions from './WorkflowActions';

const pad = (value: number) => String(value).padStart(2, '0');

const formatWaitingTime = (minutes: number) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

const helper = createColumnHelper<typeof dataTableFeatures, WorkflowRow>();

const columns = helper.columns([
  helper.accessor('name', { header: 'Nombre' }),
  helper.accessor('fromPipelineId', {
    header: 'Pipeline Origen',
    cell: ({ row }) => <Badge>{row.original.fromPipeline.name}</Badge>,
  }),
  helper.accessor('toPipelineId', {
    header: 'Pipeline Destino',
    cell: ({ row }) => <Badge variant="outline">{row.original.toPipeline.name}</Badge>,
  }),
  helper.display({
    id: 'trigger',
    header: 'Se activa',
    cell: ({ row }) => triggerOf(row.original)?.label ?? '-',
  }),
  helper.accessor('waitingTime', {
    header: 'Tiempo de espera',
    cell: ({ row }) => formatWaitingTime(row.original.waitingTime),
  }),
  helper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => <WorkflowActions workflow={row.original} />,
  }),
]);

const WorkflowsTable = () => {
  const { data, initialLoading } = useStore((state) => state);

  if (initialLoading) return <Skeleton className="h-96 w-full rounded-lg" />;

  return <DataTable columns={columns} data={data} emptyMessage="No hay workflows." />;
};

export default WorkflowsTable;
