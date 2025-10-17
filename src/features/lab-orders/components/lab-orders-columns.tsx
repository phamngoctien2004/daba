import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, PlayCircle } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { LabOrder, LabOrderStatus } from '../types'

const statusConfig: Record<
  LabOrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  CHO_THUC_HIEN: { label: 'Chờ thực hiện', variant: 'secondary' },
  DANG_THUC_HIEN: { label: 'Đang thực hiện', variant: 'default' },
  CHO_KET_QUA: { label: 'Chờ kết quả', variant: 'default' },
  HOAN_THANH: { label: 'Hoàn thành', variant: 'outline' },
  HUY_BO: { label: 'Hủy bỏ', variant: 'destructive' },
}

type ColumnsOptions = {
  onViewDetail: (id: number) => void
  onProcessLabOrder: (id: number) => void
}

export const getLabOrdersColumns = ({
  onViewDetail,
  onProcessLabOrder,
}: ColumnsOptions): ColumnDef<LabOrder>[] => [
    {
      accessorKey: 'code',
      header: 'Mã phiếu XN',
      cell: ({ row }) => {
        return <div className='font-medium'>{row.original.code}</div>
      },
    },
    {
      accessorKey: 'healthPlanName',
      header: 'Tên xét nghiệm',
      cell: ({ row }) => {
        return (
          <div className='max-w-[200px]'>
            <div className='font-medium truncate'>{row.original.healthPlanName}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'room',
      header: 'Phòng',
      cell: ({ row }) => {
        return <div className='text-sm'>{row.original.room}</div>
      },
    },
    {
      accessorKey: 'doctorPerformed',
      header: 'Bác sĩ thực hiện',
      cell: ({ row }) => {
        return <div className='text-sm'>{row.original.doctorPerformed || '-'}</div>
      },
    },
    {
      accessorKey: 'orderDate',
      header: 'Ngày chỉ định',
      cell: ({ row }) => {
        try {
          const date = new Date(row.original.orderDate)
          return (
            <div>
              {format(date, 'dd/MM/yyyy', { locale: vi })}
              <div className='text-sm text-muted-foreground'>
                {format(date, 'HH:mm', { locale: vi })}
              </div>
            </div>
          )
        } catch {
          return <div>{row.original.orderDate}</div>
        }
      },
    },
    // {
    //   accessorKey: 'price',
    //   header: 'Giá',
    //   cell: ({ row }) => {
    //     return <div className='font-medium'>{row.original.price.toLocaleString('vi-VN')} đ</div>
    //   },
    // },
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
        const labOrder = row.original
        const isPending = labOrder.status === 'CHO_THUC_HIEN'

        return (
          <Button
            size='sm'
            onClick={() => isPending ? onProcessLabOrder(labOrder.id) : onViewDetail(labOrder.id)}
            className='gap-2'
            variant={isPending ? 'default' : 'outline'}
          >
            {isPending ? (
              <>
                <PlayCircle className='h-4 w-4' />
                Thực hiện XN
              </>
            ) : (
              <>
                <Eye className='h-4 w-4' />
                Xem chi tiết
              </>
            )}
          </Button>
        )
      },
    },
  ]
