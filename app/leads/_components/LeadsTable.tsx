'use client';

import type { LeadRow } from '../types';

import { createColumnHelper } from '@tanstack/react-table';

import DataTable, { dataTableFeatures } from '@/components/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '../_store';

const helper = createColumnHelper<typeof dataTableFeatures, LeadRow>();

const columns = helper.columns([
  helper.accessor('contactName', { header: 'Nombre' }),
  helper.accessor('enrollmentDate', {
    header: 'Captación',
    cell: ({ row }) =>
      new Date(row.original.enrollmentDate).toLocaleDateString('es', { dateStyle: 'medium' }),
  }),
  helper.accessor('phone', { header: 'Contacto' }),
  helper.accessor('pipelineId', {
    header: 'Pipeline',
    cell: ({ row }) => row.original.pipeline.name,
  }),
  helper.accessor('beforePipelineId', {
    header: 'Anterior Pipeline',
    cell: ({ row }) => row.original.beforePipeline?.name ?? '—',
  }),
]);

const SEARCH_COLUMNS = ['contactName', 'phone'];

const LeadsTable = () => {
  const { data, initialLoading } = useStore((state) => state);

  if (initialLoading) return <Skeleton className="h-96 w-full rounded-lg" />;

  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumns={SEARCH_COLUMNS}
      searchPlaceholder="Buscar por nombre o teléfono"
      emptyMessage="No hay leads."
    />
  );
};

export default LeadsTable;
