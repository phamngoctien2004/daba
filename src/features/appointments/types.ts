import type { AppointmentStatus } from './api/appointments'

export type AppointmentsSearch = {
  phone?: string
  date?: string
  status?: AppointmentStatus[]
  page?: number
  pageSize?: number
}
