'use client';

import type { ColumnDef, RowData } from '@tanstack/react-table';

import { useEffect, useMemo } from 'react';
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZES = [10, 20, 50, 100];

interface Props<TData extends RowData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  selectable?: boolean;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  getRowId?: (row: TData, index: number) => string;
  pageSize?: number;
  emptyMessage?: string;
}

const defaultRowId = (row: unknown, index: number) =>
  String((row as { id?: number | string }).id ?? index);

const selectColumn = <TData extends RowData>(): DataTableColumn<TData> => ({
  id: 'select',
  header: ({ table }) => (
    <Checkbox
      aria-label="Seleccionar todas las filas de la página"
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={table.getIsSomePageRowsSelected()}
      onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      aria-label="Seleccionar fila"
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onCheckedChange={(checked) => row.toggleSelected(checked)}
    />
  ),
});

const DataTable = <TData extends RowData>({
  columns: baseColumns,
  data,
  selectable = false,
  selectedIds,
  onSelectedIdsChange,
  getRowId = defaultRowId,
  pageSize = DEFAULT_PAGE_SIZE,
  emptyMessage = 'Sin resultados.',
}: Props<TData>) => {
  const initialState = useMemo(() => ({ pagination: { pageIndex: 0, pageSize } }), [pageSize]);
  const columns = useMemo(
    () => (selectable ? [selectColumn<TData>(), ...baseColumns] : baseColumns),
    [selectable, baseColumns],
  );
  const rowSelection = useMemo(
    () => Object.fromEntries((selectedIds ?? []).map((id) => [id, true as const])),
    [selectedIds],
  );
  const table = useTable(
    {
      features: dataTableFeatures,
      columns,
      data,
      initialState,
      getRowId,
      enableRowSelection: selectable,
      ...(selectable &&
        selectedIds && {
          state: { rowSelection },
          onRowSelectionChange: (updater) => {
            const next = typeof updater === 'function' ? updater(rowSelection) : updater;

            onSelectedIdsChange?.(Object.keys(next));
          },
        }),
    },
    (state) => ({ pagination: state.pagination, rowSelection: state.rowSelection }),
  );

  // Rows that leave `data` (deleted, or filtered out by the server) leave the selection too.
  useEffect(() => {
    if (!selectable || !selectedIds?.length) return;

    const present = new Set(data.map((row, index) => getRowId(row, index)));
    const kept = selectedIds.filter((id) => present.has(id));

    if (kept.length !== selectedIds.length) onSelectedIdsChange?.(kept);
  }, [selectable, selectedIds, data, getRowId, onSelectedIdsChange]);

  const { pageIndex, pageSize: currentPageSize } = table.state.pagination;
  const pageCount = Math.max(table.getPageCount(), 1);
  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          {table.getRowCount()} resultado{table.getRowCount() === 1 ? '' : 's'}
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span>Filas</span>
            <Select
              value={String(currentPageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" className="w-20" aria-label="Filas por página">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Página</span>
            <Select
              value={String(pageIndex + 1)}
              onValueChange={(value) => table.setPageIndex(Number(value) - 1)}
            >
              <SelectTrigger size="sm" className="w-20" aria-label="Página">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: pageCount }, (_, index) => (
                  <SelectItem key={index} value={String(index + 1)}>
                    {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>de {pageCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
