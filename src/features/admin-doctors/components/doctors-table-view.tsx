import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { createDoctorsColumns } from './doctors-columns'
import type { DoctorDetail } from '../types'

const SKELETON_ROWS = Array.from({ length: 10 })
const SKELETON_COLUMNS = Array.from({ length: 7 })

interface DoctorsTableProps {
  data: DoctorDetail[]
  isLoading: boolean
  page: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onViewDetail?: (doctor: DoctorDetail) => void
  onEdit?: (doctor: DoctorDetail) => void
  onDelete?: (doctor: DoctorDetail) => void
}

export function DoctorsTable({
  data,
  isLoading,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onEdit,
  onDelete,
}: DoctorsTableProps) {
  const columns = useMemo(
    () => createDoctorsColumns({ onViewDetail, onEdit, onDelete }),
    [onViewDetail, onEdit, onDelete]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: page,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: page, pageSize })
        if (newState.pageIndex !== page) {
          onPageChange(newState.pageIndex)
        }
        if (newState.pageSize !== pageSize) {
          onPageSizeChange(newState.pageSize)
        }
      }
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {isLoading ? (
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='py-10 text-center text-muted-foreground'>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
