import type { AppointmentStatus } from './api/appointments'

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  CHO_XAC_NHAN: 'Chờ xác nhận',
  DA_XAC_NHAN: 'Đã xác nhận',
  DA_DEN: 'Đã đến',
  KHONG_DEN: 'Không đến',
}

export const STATUS_FILTER_OPTIONS = (
  Object.entries(STATUS_LABELS) as Array<[AppointmentStatus, string]>
).map(([value, label]) => ({
  value,
  label,
}))

export const getStatusBadgeVariant = (status: AppointmentStatus) => {
  switch (status) {
    case 'CHO_XAC_NHAN':
      return 'secondary' as const
    case 'DA_XAC_NHAN':
      return 'default' as const
    case 'DA_DEN':
      return 'outline' as const
    case 'KHONG_DEN':
      return 'destructive' as const
    default:
      return 'default' as const
  }
}
