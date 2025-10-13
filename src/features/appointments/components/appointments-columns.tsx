import { type ColumnDef } from '@tanstack/react-table'
import { format, isValid, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  STATUS_LABELS,
  getStatusBadgeVariant,
} from '../constants'
import {
  type Appointment,
  type AppointmentStatus,
} from '../api/appointments'
import {
  CheckCircle2,
  ClipboardPlus,
  Loader2,
  XCircle,
} from 'lucide-react'

const formatDateDisplay = (value: string) => {
  try {
    const parsed = parseISO(value)
    if (isValid(parsed)) {
      return format(parsed, 'dd/MM/yyyy')
    }
  } catch {
    // noop – fallback to raw string below
  }
  return value
}

const formatTimeDisplay = (value: string | null) =>
  value && value.trim() !== '' ? value : '—'

const renderDoctor = (appointment: Appointment) => {
  if (!appointment.doctorResponse) {
    return <span className='text-muted-foreground text-sm'>Chưa chỉ định</span>
  }

  return (
    <div className='space-y-1 text-sm'>
      <div>{appointment.doctorResponse.position}</div>
      <div className='text-muted-foreground text-xs'>
        ID: {appointment.doctorResponse.id}
      </div>
    </div>
  )
}

const renderDepartment = (appointment: Appointment) => {
  if (!appointment.departmentResponse) {
    return <span className='text-muted-foreground text-sm'>Chưa rõ</span>
  }

  return (
    <div className='space-y-1 text-sm'>
      <div>{appointment.departmentResponse.name}</div>
      <div className='text-muted-foreground text-xs'>
        ID: {appointment.departmentResponse.id}
      </div>
    </div>
  )
}

type GetAppointmentsColumnsOptions = {
  onUpdateStatus: (id: number, status: AppointmentStatus) => void
  onOpenMedicalRecord: (id: number) => void
  pendingAppointmentId: number | null
  isConfirmPending: boolean
}

export const getAppointmentsColumns = ({
  onUpdateStatus,
  onOpenMedicalRecord,
  pendingAppointmentId,
  isConfirmPending,
}: GetAppointmentsColumnsOptions): ColumnDef<Appointment>[] => [
  {
    accessorKey: 'fullName',
    header: 'Bệnh nhân',
    cell: ({ row }) => {
      const appointment = row.original
      return (
        <div className='space-y-1'>
          <div className='font-medium'>{appointment.fullName}</div>
          <div className='text-muted-foreground text-xs'>
            Ngày sinh: {formatDateDisplay(appointment.birth)}
          </div>
        </div>
      )
    },
    meta: {
      className: 'min-w-[220px]',
    },
  },
  {
    id: 'contact',
    header: 'Liên hệ',
    enableSorting: false,
    cell: ({ row }) => {
      const appointment = row.original
      return (
        <div className='space-y-1 text-sm'>
          <div>{appointment.phone ?? '—'}</div>
          <div className='text-muted-foreground text-xs'>
            Email: {appointment.email ?? '—'}
          </div>
        </div>
      )
    },
  },
  {
    id: 'schedule',
    header: 'Lịch hẹn',
    enableSorting: false,
    cell: ({ row }) => {
      const appointment = row.original
      return (
        <div className='space-y-1 text-sm'>
          <div>
            {formatDateDisplay(appointment.date)} •{' '}
            {formatTimeDisplay(appointment.time)}
          </div>
          <div className='text-muted-foreground text-xs'>
            Tạo lúc {formatDateDisplay(appointment.createdAt)}
          </div>
        </div>
      )
    },
  },
  {
    id: 'doctor',
    header: 'Bác sĩ',
    enableSorting: false,
    cell: ({ row }) => renderDoctor(row.original),
  },
  {
    id: 'department',
    header: 'Khoa',
    enableSorting: false,
    cell: ({ row }) => renderDepartment(row.original),
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    enableSorting: false,
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant={getStatusBadgeVariant(status)}>
          {STATUS_LABELS[status]}
        </Badge>
      )
    },
    meta: {
      className: 'min-w-[140px]',
    },
  },
  {
    id: 'actions',
    header: () => <span className='sr-only'>Thao tác</span>,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const appointment = row.original
      const isLoading =
        isConfirmPending && pendingAppointmentId === appointment.id

      return (
        <div className='flex flex-wrap items-center justify-end gap-2'>
          {appointment.status === 'CHO_XAC_NHAN' && (
            <>
              <Button
                size='sm'
                onClick={() => onUpdateStatus(appointment.id, 'DA_XAC_NHAN')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='me-2 size-4 animate-spin' />
                ) : (
                  <CheckCircle2 className='me-2 size-4' />
                )}
                Xác nhận
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => onUpdateStatus(appointment.id, 'KHONG_DEN')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='me-2 size-4 animate-spin' />
                ) : (
                  <XCircle className='me-2 size-4' />
                )}
                Hủy
              </Button>
            </>
          )}

          {appointment.status === 'DA_XAC_NHAN' && (
            <>
              <Button
                size='sm'
                onClick={() => onUpdateStatus(appointment.id, 'DA_DEN')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='me-2 size-4 animate-spin' />
                ) : (
                  <CheckCircle2 className='me-2 size-4' />
                )}
                Đã đến
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => onUpdateStatus(appointment.id, 'KHONG_DEN')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='me-2 size-4 animate-spin' />
                ) : (
                  <XCircle className='me-2 size-4' />
                )}
                Hủy
              </Button>
            </>
          )}

          {appointment.status === 'DA_DEN' && (
            <Button
              size='sm'
              onClick={() => onOpenMedicalRecord(appointment.id)}
            >
              <ClipboardPlus className='me-2 size-4' />
              Tạo phiếu khám
            </Button>
          )}
        </div>
      )
    },
    meta: {
      className: 'min-w-[220px]',
      tdClassName: 'text-end',
    },
  },
]
