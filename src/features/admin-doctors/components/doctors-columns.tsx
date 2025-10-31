import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import type { DoctorDetail } from '../types'

interface DoctorColumnsProps {
  onViewDetail?: (doctor: DoctorDetail) => void
  onEdit?: (doctor: DoctorDetail) => void
  onDelete?: (doctor: DoctorDetail) => void
}

export const createDoctorsColumns = ({
  onViewDetail,
  onEdit,
  onDelete,
}: DoctorColumnsProps = {}): ColumnDef<DoctorDetail>[] => [
    {
      accessorKey: 'fullName',
      header: 'Họ và tên',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.fullName}</div>
      ),
    },
    {
      accessorKey: 'degreeResponse.degreeName',
      header: 'Bằng cấp',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.degreeResponse.degreeName}</div>
      ),
    },
    {
      accessorKey: 'position',
      header: 'Chức danh',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.position}</div>
      ),
    },
    {
      accessorKey: 'departmentResponse.name',
      header: 'Khoa',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.departmentResponse.name}</Badge>
      ),
    },
    {
      accessorKey: 'roomNumber',
      header: 'Phòng khám',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.roomNumber}</div>
          <div className="text-sm text-muted-foreground">{row.original.roomName}</div>
        </div>
      ),
    },
    {
      accessorKey: 'available',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Badge variant={row.original.available ? 'default' : 'destructive'}>
          {row.original.available ? 'Hoạt động' : 'Không hoạt động'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const doctor = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onViewDetail && (
                <DropdownMenuItem onClick={() => onViewDetail(doctor)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(doctor)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(doctor)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
