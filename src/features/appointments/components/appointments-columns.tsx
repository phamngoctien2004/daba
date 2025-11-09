import { type ColumnDef } from '@tanstack/react-table'
import { format, isValid, parseISO, isAfter, startOfDay, isSameDay } from 'date-fns'
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

// Helper function to check if current time is within appointment shift
const isAppointmentTimeReached = (appointmentDate: string, appointmentTime: string): boolean => {
  const now = new Date()
  const apptDate = parseISO(appointmentDate)

  // If appointment is in the future, not reached yet
  if (isAfter(apptDate, startOfDay(now))) {
    return false
  }

  // If appointment is in the past, already reached
  if (!isSameDay(apptDate, now)) {
    return isAfter(now, apptDate)
  }

  // Same day - check time/shift
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute

  // Parse appointment time (format: "HH:mm:ss" or "HH:mm")
  const timeParts = appointmentTime.split(':')
  const apptHour = parseInt(timeParts[0], 10)
  const apptMinute = parseInt(timeParts[1] || '0', 10)
  const apptTimeInMinutes = apptHour * 60 + apptMinute

  // Determine shift start times (in minutes from midnight)
  let shiftStartMinutes = 0

  if (apptHour >= 7 && apptHour < 12) {
    // Morning shift: 7:00 - 12:00
    shiftStartMinutes = 7 * 60 // 7:00
  } else if (apptHour >= 12 && apptHour < 17) {
    // Afternoon shift: 12:00 - 17:00
    shiftStartMinutes = 12 * 60 // 12:00
  } else {
    // Evening shift: 17:00 - 22:00
    shiftStartMinutes = 17 * 60 // 17:00
  }

  // Check if current time has reached the shift start
  return currentTimeInMinutes >= shiftStartMinutes
}

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

        // Check if appointment time/shift has been reached
        const isTimeReached = isAppointmentTimeReached(appointment.date, appointment.time)

        return (
          <div className='flex flex-wrap items-center justify-end gap-2'>
            {appointment.status === 'DA_XAC_NHAN' && (
              <>
                {!isTimeReached ? (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled
                  >
                    <Clock className='me-2 size-4' />
                    Chưa đến giờ khám
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
