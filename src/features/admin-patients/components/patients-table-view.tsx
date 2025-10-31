import { useEffect, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTableUrlState, type NavigateFn } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getPatientsColumns } from './patients-columns'
import type { Patient } from '../api/patients'
import type { PatientsSearch } from '../types'

const SKELETON_ROWS = Array.from({ length: 5 })
const SKELETON_COLUMNS = Array.from({ length: 9 })

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

type PatientsTableProps = {
  data: Patient[]
  total: number
  pageCount: number
  isLoading: boolean
  isRefetching: boolean
  onViewDetail: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onResetFilters: () => void
  search: PatientsSearch
  navigate: NavigateFn
}

export function PatientsTable({
  data,
  total,
  pageCount,
  isLoading,
  isRefetching,
  onViewDetail,
  onEdit,
  onDelete,
  onResetFilters,
  search,
  navigate,
}: PatientsTableProps) {
  const {
    globalFilter,
    onGlobalFilterChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: {
      defaultPage: DEFAULT_PAGE,
      defaultPageSize: DEFAULT_PAGE_SIZE,
    },
    globalFilter: { enabled: true, key: 'keyword', trim: true },
  })

  const columns = useMemo(
    () => getPatientsColumns({ onViewDetail, onEdit, onDelete }),
    [onViewDetail, onEdit, onDelete]
  )

  const effectivePageCount = Math.max(pageCount, 1)

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    manualPagination: true,
    manualFiltering: true,
    pageCount: effectivePageCount,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange,
    onGlobalFilterChange,
    autoResetPageIndex: false,
  })

  useEffect(() => {
    ensurePageInRange(effectivePageCount)
  }, [effectivePageCount, ensurePageInRange])

  const startRow = data.length
    ? pagination.pageIndex * pagination.pageSize + 1
    : 0
  const endRow = data.length
    ? Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)
    : 0

  const handleResetAll = () => {
    table.setGlobalFilter('')
    table.setPageIndex(0)
    table.setPageSize(DEFAULT_PAGE_SIZE)
    onResetFilters()
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='flex flex-1 flex-col gap-4'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='Tìm theo tên, số điện thoại hoặc CCCD...'
          />
        </div>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleResetAll}
          >
            <RotateCcw className='me-2 size-4' />
            Đặt lại
          </Button>
        </div>
      </div>

      <div className='flex flex-col gap-2 rounded-lg bg-card/40 p-4'>
        <div className='flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground'>
          <span>Tổng cộng {total} bệnh nhân</span>
          {isRefetching && (
            <span className='flex items-center gap-2 text-primary'>
              {/* <Loader2 className='size-4 animate-spin' />
              Đang đồng bộ dữ liệu... */}
            </span>
          )}
        </div>
        <div className='overflow-hidden rounded-md border'>
          <Table className='min-w-[960px]'>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading && data.length === 0 ? (
                SKELETON_ROWS.map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`}>
                    {SKELETON_COLUMNS.map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className='h-4 w-full' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.columnDef.meta?.className,
                          cell.column.columnDef.meta?.tdClassName
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className='py-10 text-center text-muted-foreground'>
                    Không có bệnh nhân phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='text-sm text-muted-foreground'>
            Hiển thị {startRow} – {endRow} trên tổng {total} bệnh nhân.
          </div>
          <DataTablePagination table={table} />
        </div>
      </div>
    </div>
  )
}
