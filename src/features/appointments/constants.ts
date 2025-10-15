import type { AppointmentStatus } from './api/appointments'

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  DA_XAC_NHAN: 'Đã xác nhận',
  KHONG_DEN: 'Không đến',
  DANG_KHAM: 'Đang khám',
}

export const STATUS_FILTER_OPTIONS = (
  Object.entries(STATUS_LABELS) as Array<[AppointmentStatus, string]>
).map(([value, label]) => ({
  value,
  label,
}))

export const getStatusBadgeVariant = (status: AppointmentStatus) => {
  switch (status) {
    case 'DA_XAC_NHAN':
      return 'default' as const
    case 'KHONG_DEN':
      return 'destructive' as const
    case 'DANG_KHAM':
      return 'outline' as const
    default:
      return 'default' as const
  }
}
