import { type ColumnDef } from '@tanstack/react-table'
import { format, isValid, parseISO, isAfter, startOfDay } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  STATUS_LABELS,
  getStatusBadgeVariant,
} from '../constants'
import {
  type Appointment,
} from '../api/appointments'
import {
  ClipboardPlus,
  Clock,
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
    return <span className='text-muted-foreground text-sm'>Chưa có dữ liệu</span>
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

const renderHealthPlan = (appointment: Appointment) => {
  if (!appointment.healthPlanResponse) {
    return <span className='text-muted-foreground text-sm'>Khám thường</span>
  }

  return (
    <div className='space-y-1 text-sm'>
      <div className='font-medium'>{appointment.healthPlanResponse.name}</div>
      <div className='text-muted-foreground text-xs'>
        {appointment.healthPlanResponse.price > 0
          ? `${appointment.healthPlanResponse.price.toLocaleString('vi-VN')} đ`
          : ''}
      </div>
    </div>
  )
}

type GetAppointmentsColumnsOptions = {
  onOpenMedicalRecord: (id: number) => void
}

export const getAppointmentsColumns = ({
  onOpenMedicalRecord,
}: GetAppointmentsColumnsOptions): ColumnDef<Appointment>[] => [
    {
      accessorKey: 'patientResponse.fullName',
      header: 'Bệnh nhân',
      cell: ({ row }) => {
        const appointment = row.original
        return (
          <div className='space-y-1'>
            <div className='font-medium'>{appointment.patientResponse.fullName}</div>
            <div className='text-muted-foreground text-xs'>
              Ngày sinh: {formatDateDisplay(appointment.patientResponse.birth)}
            </div>
            <div className='text-muted-foreground text-xs'>
              Mã BN: {appointment.patientResponse.code}
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
            <div>{appointment.patientResponse.phone ?? '—'}</div>
            <div className='text-muted-foreground text-xs'>
              Email: {appointment.patientResponse.email ?? '—'}
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
            {appointment.createdAt && (
              <div className='text-muted-foreground text-xs'>
                Tạo lúc {formatDateDisplay(appointment.createdAt)}
              </div>
            )}
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
      id: 'healthPlan',
      header: 'Gói dịch vụ',
      enableSorting: false,
      cell: ({ row }) => renderHealthPlan(row.original),
      meta: {
        className: 'min-w-[200px]',
      },
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

        // Check if appointment date is in the future
        const appointmentDate = parseISO(appointment.date)
        const today = startOfDay(new Date())
        const isFutureAppointment = isValid(appointmentDate) && isAfter(appointmentDate, today)

        return (
          <div className='flex flex-wrap items-center justify-end gap-2'>
            {appointment.status === 'DA_XAC_NHAN' && (
              <>
                {isFutureAppointment ? (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled
                  >
                    <Clock className='me-2 size-4' />
                    Chưa đến lịch hẹn
                  </Button>
                ) : (
                  <Button
                    size='sm'
                    onClick={() => onOpenMedicalRecord(appointment.id)}
                  >
                    <ClipboardPlus className='me-2 size-4' />
                    Tạo phiếu khám
                  </Button>
                )}
              </>
            )}

            {appointment.status === 'DANG_KHAM' && (
              <Button
                size='sm'
                variant='outline'
                disabled
              >
                Đang khám bệnh
              </Button>
            )}

            {/* KHONG_DEN - no actions */}
          </div>
        )
      },
      meta: {
        className: 'min-w-[220px]',
        tdClassName: 'text-end',
      },
    },
  ]
