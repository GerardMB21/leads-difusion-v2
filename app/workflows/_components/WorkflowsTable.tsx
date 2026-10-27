'use client';

import type { WorkflowRow } from '../types';

import { useRouter } from 'next/navigation';
import { createColumnHelper } from '@tanstack/react-table';

import BulkActionsBar from '@/components/BulkActionsBar';
import DataTable, { dataTableFeatures } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api, getApiErrorMessage } from '@/lib/api';
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
    cell: ({ row }) =>
      row.original.whenNotResponse ? formatWaitingTime(row.original.waitingTime) : '-',
  }),
  helper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => <WorkflowActions workflow={row.original} />,
  }),
]);

const WorkflowsTable = () => {
  const router = useRouter();
  const { data, selectedIds, setSelectedIds, initialLoading } = useStore((state) => state);

  const onDelete = async () => {
    try {
      await api.delete('/workflows', { data: { ids: selectedIds.map(Number) } });
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'No se pudieron eliminar los workflows'));
    }

    setSelectedIds([]);
    router.refresh();
  };

  if (initialLoading) return <Skeleton className="h-96 w-full rounded-lg" />;

  return (
    <div className="flex flex-col gap-4">
      <BulkActionsBar
        count={selectedIds.length}
        noun={['workflow', 'workflows']}
        onDelete={onDelete}
      />
      <DataTable
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        columns={columns}
        data={data}
        emptyMessage="No hay workflows."
      />
    </div>
  );
};

export default WorkflowsTable;
