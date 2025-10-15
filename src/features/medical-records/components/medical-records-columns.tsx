import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { MedicalRecord, MedicalRecordStatus } from '../api/medical-records'

const statusConfig: Record<
  MedicalRecordStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  DANG_KHAM: { label: 'Đang khám', variant: 'default' },
  CHO_XET_NGHIEM: { label: 'Chờ xét nghiệm', variant: 'secondary' },
  HOAN_THANH: { label: 'Hoàn thành', variant: 'outline' },
  HUY: { label: 'Hủy', variant: 'destructive' },
}

type ColumnsOptions = {
  onViewDetail: (id: string) => void
}

export const getMedicalRecordsColumns = ({
  onViewDetail,
}: ColumnsOptions): ColumnDef<MedicalRecord>[] => [
    {
      accessorKey: 'code',
      header: 'Mã phiếu',
      cell: ({ row }) => {
        return <div className='font-medium'>{row.original.code}</div>
      },
    },
    {
      accessorKey: 'patientName',
      header: 'Bệnh nhân',
      cell: ({ row }) => {
        return (
          <div>
            <div className='font-medium'>{row.original.patientName}</div>
            {row.original.patientPhone && (
              <div className='text-sm text-muted-foreground'>{row.original.patientPhone}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'patientGender',
      header: 'Giới tính',
      cell: ({ row }) => {
        const gender = row.original.patientGender
        return <div>{gender === 'NAM' ? 'Nam' : gender === 'NU' ? 'Nữ' : 'Khác'}</div>
      },
    },
    {
      accessorKey: 'date',
      header: 'Ngày khám',
      cell: ({ row }) => {
        try {
          const date = new Date(row.original.date)
          return (
            <div>
              {format(date, 'dd/MM/yyyy', { locale: vi })}
              <div className='text-sm text-muted-foreground'>
                {format(date, 'HH:mm', { locale: vi })}
              </div>
            </div>
          )
        } catch {
          return <div>{row.original.date}</div>
        }
      },
    },
    {
      accessorKey: 'symptoms',
      header: 'Triệu chứng',
      cell: ({ row }) => {
        const symptoms = row.original.symptoms
        return (
          <div className='max-w-[200px] truncate' title={symptoms || ''}>
            {symptoms || '-'}
          </div>
        )
      },
    },

    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.original.status
        const config = statusConfig[status] || { label: status, variant: 'outline' as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },

    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const record = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Mở menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onViewDetail(record.id)}>
                <Eye className='mr-2 h-4 w-4' />
                Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
