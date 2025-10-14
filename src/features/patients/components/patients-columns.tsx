import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { Patient } from '../api/patients'

type ColumnsOptions = {
  onViewDetail: (id: number) => void
  onEdit?: (id: number) => void
}

export const getPatientsColumns = ({
  onViewDetail,
  onEdit,
}: ColumnsOptions): ColumnDef<Patient>[] => [
  {
    accessorKey: 'code',
    header: 'Mã bệnh nhân',
    cell: ({ row }) => {
      return <div className='font-medium'>{row.original.code}</div>
    },
  },
  {
    accessorKey: 'fullName',
    header: 'Họ và tên',
    cell: ({ row }) => {
      return (
        <div>
          <div className='font-medium'>{row.original.fullName}</div>
          {row.original.phone && (
            <div className='text-sm text-muted-foreground'>{row.original.phone}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'gender',
    header: 'Giới tính',
    cell: ({ row }) => {
      const gender = row.original.gender
      return <div>{gender === 'NAM' ? 'Nam' : gender === 'NU' ? 'Nữ' : 'Khác'}</div>
    },
  },
  {
    accessorKey: 'birth',
    header: 'Ngày sinh',
    cell: ({ row }) => {
      if (!row.original.birth) return <div>-</div>
      try {
        const date = new Date(row.original.birth)
        return <div>{format(date, 'dd/MM/yyyy', { locale: vi })}</div>
      } catch {
        return <div>{row.original.birth}</div>
      }
    },
  },
  {
    accessorKey: 'cccd',
    header: 'CCCD',
    cell: ({ row }) => {
      return <div>{row.original.cccd || '-'}</div>
    },
  },
  {
    accessorKey: 'address',
    header: 'Địa chỉ',
    cell: ({ row }) => {
      const address = row.original.address
      return (
        <div className='max-w-[200px] truncate' title={address || ''}>
          {address || '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'bloodType',
    header: 'Nhóm máu',
    cell: ({ row }) => {
      const bloodType = row.original.bloodType
      return bloodType ? (
        <Badge variant='outline'>{bloodType}</Badge>
      ) : (
        <div>-</div>
      )
    },
  },
  {
    accessorKey: 'registrationDate',
    header: 'Ngày đăng ký',
    cell: ({ row }) => {
      try {
        const date = new Date(row.original.registrationDate)
        return (
          <div>
            {format(date, 'dd/MM/yyyy', { locale: vi })}
            <div className='text-sm text-muted-foreground'>
              {format(date, 'HH:mm', { locale: vi })}
            </div>
          </div>
        )
      } catch {
        return <div>{row.original.registrationDate}</div>
      }
    },
  },
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => {
      const patient = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Mở menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onViewDetail(patient.id)}>
              <Eye className='mr-2 h-4 w-4' />
              Xem chi tiết
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(patient.id)}>
                <Edit className='mr-2 h-4 w-4' />
                Chỉnh sửa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
