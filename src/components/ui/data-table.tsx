'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  pageSize?: number;
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  pageSize = 10,
  totalCount,
  currentPage = 1,
  onPageChange,
  isLoading = false,
  emptyStateTitle,
  emptyStateDescription,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [localSearch, setLocalSearch] = React.useState(searchValue || '');
  const [inputValue, setInputValue] = React.useState(searchValue || '');
  
  // Use controlled search if onSearchChange is provided, otherwise use local state
  const isServerSideSearch = !!onSearchChange;
  const searchFilter = isServerSideSearch ? searchValue || '' : localSearch;
  
  // Debounce input value for server-side search to avoid too many API calls
  const debouncedInputValue = useDebounce(inputValue, 300);
  
  // Effect to trigger search change when debounced value changes (only for server-side)
  React.useEffect(() => {
    if (isServerSideSearch && onSearchChange && debouncedInputValue !== (searchValue || '')) {
      onSearchChange(debouncedInputValue);
      // Reset to first page when search changes
      if (onPageChange) {
        onPageChange(1);
      }
    }
  }, [debouncedInputValue, isServerSideSearch, onSearchChange, onPageChange, searchValue]);
  
  // Sync input value with searchValue when it changes externally
  React.useEffect(() => {
    if (isServerSideSearch && searchValue !== undefined) {
      setInputValue(searchValue || '');
    }
  }, [searchValue, isServerSideSearch]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSideSearch ? undefined : getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: isServerSideSearch ? undefined : getFilteredRowModel(),
    onGlobalFilterChange: (updater) => {
      const newValue = typeof updater === 'function' ? updater(searchFilter) : updater;
      if (isServerSideSearch && onSearchChange) {
        onSearchChange(newValue);
        // Reset to first page when search changes
        if (onPageChange) {
          onPageChange(1);
        }
      } else {
        setLocalSearch(newValue);
      }
    },
    globalFilterFn: 'includesString',
    manualPagination: !!totalCount, // Si hay totalCount, la paginación es server-side
    manualFiltering: isServerSideSearch, // Si hay onSearchChange, el filtrado es server-side
    pageCount: totalCount ? Math.ceil(totalCount / pageSize) : undefined,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchFilter,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
  });

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : table.getPageCount();
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      table.setPageIndex(newPage - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {searchKey && (
          <div className="flex items-center py-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Skeleton className="h-10 w-full pl-10" />
            </div>
          </div>
        )}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      <SkeletonText lines={1} className="h-4" />
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <SkeletonText lines={1} className="h-4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center py-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={isServerSideSearch ? inputValue : searchFilter}
              onChange={(event) => {
                const value = event.target.value;
                if (isServerSideSearch) {
                  // Update input value immediately for responsive UI
                  // The debounced effect will trigger the actual search
                  setInputValue(value);
                } else {
                  setLocalSearch(value);
                }
              }}
              className="pl-10"
            />
          </div>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 p-0">
                  <EmptyState
                    variant="search"
                    title={emptyStateTitle}
                    description={emptyStateDescription}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getRowModel().rows?.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {totalCount !== undefined ? (
              <>
                Mostrando {((currentPage - 1) * pageSize) + 1} a{' '}
                {Math.min(currentPage * pageSize, totalCount)} de {totalCount} resultados
              </>
            ) : (
              <>
                Página {currentPage} de {totalPages}
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={!canPreviousPage}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!canPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!canNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={!canNextPage}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

