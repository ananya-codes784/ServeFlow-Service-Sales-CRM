import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Download } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  searchPlaceholder?: string;
  onExport?: () => void;
  isLoading?: boolean;
  pageSize?: number;
}

function DataTable<T>({ data, columns, searchPlaceholder = 'Search...', onExport, isLoading = false, pageSize = 10 }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
          />
        </div>
        {onExport && (
          <button onClick={onExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-white/5">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-slate-400">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-sm text-slate-500">
                  No records found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 text-sm text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/5">
        <span className="text-xs text-slate-500">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}{' '}
          of {table.getFilteredRowModel().rows.length} entries
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-white/5 rounded-lg">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
