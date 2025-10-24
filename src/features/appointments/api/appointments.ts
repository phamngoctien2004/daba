import { get, post, put } from '@/lib/api-client'

export type AppointmentStatus =
  | 'DA_XAC_NHAN'
  | 'KHONG_DEN'
  | 'DANG_KHAM'
  | 'HOAN_THANH'

export interface AppointmentHealthPlan {
  id: number
  name: string
  price: number
}

export interface AppointmentDoctor {
  id: number
  position: string
  available: boolean
}

export interface AppointmentDepartment {
  id: number
  name: string
}

export interface AppointmentPatient {
  id: number
  code: string
  registrationDate: string
  fullName: string
  phone: string | null
  birth: string
  gender: 'NAM' | 'NU'
  email: string | null
}

export interface Appointment {
  id: number
  patientResponse: AppointmentPatient
  healthPlanResponse: AppointmentHealthPlan | null
  doctorResponse: AppointmentDoctor | null
  date: string
  time: string
  status: AppointmentStatus
  symptoms: string | null
  invoiceCode: string | null
  totalAmount: number

  // Legacy fields for backward compatibility (computed)
  patientId?: number
  fullName?: string
  phone?: string | null
  gender?: 'NAM' | 'NU'
  birth?: string
  email?: string | null
  address?: string | null
  departmentResponse?: AppointmentDepartment | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface AppointmentListParams {
  phone?: string
  date?: string
  status?: AppointmentStatus | 'ALL'
  page?: number
  pageSize?: number
}

export interface AppointmentPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface AppointmentListResult {
  appointments: Appointment[]
  pagination: AppointmentPagination
  message: string
}

interface AppointmentsApiResponse {
  data?: unknown
  message?: string
  pagination?: unknown
}

type RecordWithAppointments = Record<string, unknown> & {
  items?: unknown
  content?: unknown
  data?: unknown
  page?: unknown
  currentPage?: unknown
  pageNumber?: unknown
  pageSize?: unknown
  size?: unknown
  limit?: unknown
  total?: unknown
  totalCount?: unknown
  totalElements?: unknown
  totalPages?: unknown
}

export const DEFAULT_APPOINTMENT_PAGE = 1
export const DEFAULT_APPOINTMENT_PAGE_SIZE = 10

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isAppointmentArray = (value: unknown): value is Appointment[] =>
  Array.isArray(value)

const takeFirstNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }
  return undefined
}

const normalisePage = (page?: number) => {
  if (typeof page !== 'number' || Number.isNaN(page)) {
    return DEFAULT_APPOINTMENT_PAGE
  }

  if (page < 1) {
    return 1
  }

  return Math.floor(page)
}

const resolveAppointmentArray = (raw: unknown): Appointment[] => {
  if (isAppointmentArray(raw)) {
    return raw
  }

  if (isRecord(raw)) {
    const record = raw as RecordWithAppointments

    if (isAppointmentArray(record.items)) {
      return record.items
    }

    if (isAppointmentArray(record.content)) {
      return record.content
    }

    if (isAppointmentArray(record.data)) {
      return record.data
    }
  }

  return []
}

const extractPaginationNumbers = (
  raw: RecordWithAppointments | undefined,
  responsePagination: unknown,
  params: AppointmentListParams
): AppointmentPagination => {
  const requestedPage = params.page ?? DEFAULT_APPOINTMENT_PAGE
  const requestedPageSize = params.pageSize ?? DEFAULT_APPOINTMENT_PAGE_SIZE

  let page = requestedPage
  let pageSize = requestedPageSize
  let total = 0
  let totalPages = 0

  // Try to extract from Spring Data's pageable structure first
  if (isRecord(raw) && isRecord(raw.pageable)) {
    const pageable = raw.pageable
    const inferredPageNumber = takeFirstNumber(pageable.pageNumber)
    const inferredPageSize = takeFirstNumber(pageable.pageSize)

    // Spring Data pageNumber is 0-based, convert to 1-based
    if (typeof inferredPageNumber === 'number') {
      page = inferredPageNumber + 1
    }

    if (typeof inferredPageSize === 'number') {
      pageSize = Math.max(1, Math.floor(inferredPageSize))
    }
  }

  // Extract total and totalPages from Spring Data response
  if (raw) {
    const inferredTotal = takeFirstNumber(
      raw.totalElements,
      raw.total,
      raw.totalCount
    )
    const inferredTotalPages = takeFirstNumber(raw.totalPages)

    if (typeof inferredTotal === 'number') {
      total = Math.max(0, Math.floor(inferredTotal))
    }

    if (typeof inferredTotalPages === 'number') {
      totalPages = Math.max(0, Math.floor(inferredTotalPages))
    }
  }

  // Fallback: try separate pagination object
  if (isRecord(responsePagination)) {
    const inferredPage = takeFirstNumber(
      responsePagination.page,
      responsePagination.currentPage,
      responsePagination.pageNumber
    )
    const inferredPageSize = takeFirstNumber(
      responsePagination.pageSize,
      responsePagination.size
    )
    const inferredTotal = takeFirstNumber(
      responsePagination.total,
      responsePagination.totalElements,
      responsePagination.totalCount
    )
    const inferredTotalPages = takeFirstNumber(
      responsePagination.totalPages
    )

    if (typeof inferredPage === 'number') {
      // Assume 0-based, convert to 1-based
      page = inferredPage >= 0 ? inferredPage + 1 : normalisePage(inferredPage)
    }

    if (typeof inferredPageSize === 'number') {
      pageSize = Math.max(1, Math.floor(inferredPageSize))
    }

    if (typeof inferredTotal === 'number') {
      total = Math.max(0, Math.floor(inferredTotal))
    }

    if (typeof inferredTotalPages === 'number') {
      totalPages = Math.max(0, Math.floor(inferredTotalPages))
    }
  }

  // Calculate missing values
  if (totalPages === 0 && pageSize > 0 && total > 0) {
    totalPages = Math.max(1, Math.ceil(total / pageSize))
  }

  if (totalPages === 0 && total === 0) {
    totalPages = 0
  }

  if (total === 0 && raw && isAppointmentArray(raw.content)) {
    total = raw.content.length
    totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)
  }

  return {
    page: normalisePage(page),
    pageSize,
    total,
    totalPages,
  }
}

export const fetchAppointments = async (
  params: AppointmentListParams
): Promise<AppointmentListResult> => {
  const searchParams: Record<string, string> = {}

  if (params.phone?.trim()) {
    searchParams.phone = params.phone.trim()
  }

  if (params.date?.trim()) {
    searchParams.date = params.date.trim()
  }

  if (params.status && params.status !== 'ALL') {
    searchParams.status = params.status
  }

  // Send page and limit directly to API
  const page = params.page ?? DEFAULT_APPOINTMENT_PAGE
  const limit = params.pageSize ?? DEFAULT_APPOINTMENT_PAGE_SIZE

  searchParams.page = String(page)
  searchParams.limit = String(limit)

  const { data } = await get<AppointmentsApiResponse>('/appointments', {
    params: searchParams,
  })

  const response = data ?? {}
  const rawData = isRecord(response) ? response.data : undefined
  const appointments = resolveAppointmentArray(rawData)

  const pagination = extractPaginationNumbers(
    isRecord(rawData) ? (rawData as RecordWithAppointments) : undefined,
    isRecord(response) ? response.pagination : undefined,
    params
  )

  return {
    appointments,
    pagination,
    message: isRecord(response) && typeof response.message === 'string'
      ? response.message
      : 'Lấy danh sách lịch khám thành công',
  }
}

export interface ConfirmAppointmentPayload {
  id: number
  status: AppointmentStatus
}

interface ConfirmAppointmentApiResponse {
  data?: unknown
  message?: string
}

export const confirmAppointment = async (
  payload: ConfirmAppointmentPayload
) => {
  const { data } = await put<ConfirmAppointmentApiResponse>(
    '/appointments/confirm',
    payload
  )

  const response = data ?? {}
  const appointment = isRecord(response) ? response.data : undefined

  return {
    appointment: isRecord(appointment)
      ? (appointment as unknown as Appointment)
      : undefined,
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Cập nhật trạng thái thành công',
  }
}

/**
 * Create Appointment Request Payload
 */
export interface CreateAppointmentPayload {
  healthPlanId?: number
  doctorId: number
  departmentId: number
  patientId: number
  fullName: string
  phone?: string
  gender: 'NAM' | 'NU'
  birth: string // YYYY-MM-DD
  email?: string
  address?: string
  date: string // YYYY-MM-DD
  time: string // HH:mm:ss
  symptoms?: string
}

interface CreateAppointmentApiResponse {
  data?: unknown
  message?: string
}

/**
 * Create new appointment
 * POST /api/appointments
 */
export const createAppointment = async (
  payload: CreateAppointmentPayload
) => {
  const { data } = await post<CreateAppointmentApiResponse>(
    '/appointments',
    payload
  )

  const response = data ?? {}

  return {
    success: true,
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Đặt lịch khám thành công',
  }
}
