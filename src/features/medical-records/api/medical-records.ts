import { get, post, put } from '@/lib/api-client'

export interface MedicalRecord {
  id: number
  code: string
  patientId: number
  patientName: string
  doctorId: number | null
  doctorName: string | null
  healthPlanId: number | null
  healthPlanName: string | null
  symptoms: string
  clinicalExamination: string | null
  diagnosis: string | null
  treatmentPlan: string | null
  note: string | null
  status: 'DANG_KHAM' | 'CHO_XET_NGHIEM' | 'HOAN_THANH' | 'HUY'
  total: number
  paid: number
  date: string
  invoiceId: number | null
  createdAt: string
  updatedAt: string
}

export interface MedicalRecordListItem {
  id: number
  recordCode: string
  patientName: string
  doctorName: string | null
  date: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
}

interface MedicalRecordApiResponse {
  data?: unknown
  message?: string
}

interface MedicalRecordsListApiResponse {
  data?: unknown
  message?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Fetch medical records list with filters
 * GET /api/medical-record
 */
export interface FetchMedicalRecordsInput {
  keyword?: string
  date?: string // yyyy-MM-dd
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  page?: number
  pageSize?: number
}

export interface MedicalRecordsPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export const fetchMedicalRecords = async (
  input: FetchMedicalRecordsInput = {}
): Promise<{
  medicalRecords: MedicalRecordListItem[]
  pagination: MedicalRecordsPagination
}> => {
  const params: Record<string, unknown> = {}

  if (input.keyword) params.keyword = input.keyword
  if (input.date) params.date = input.date
  if (input.status) params.status = input.status

  // Convert page/pageSize to offset/limit
  const page = input.page || 1
  const limit = input.pageSize || 10
  const offset = (page - 1) * limit

  params.offset = offset
  params.limit = limit

  const { data } = await get<MedicalRecordsListApiResponse>('/medical-record', { params })

  const response = data ?? {}
  let medicalRecords: MedicalRecordListItem[] = []
  let pagination: MedicalRecordsPagination = {
    page: input.page || 1,
    pageSize: input.pageSize || 10,
    total: 0,
    totalPages: 0,
  }

  // Check if response has Spring Boot pagination structure
  if (isRecord(response) && isRecord(response.data)) {
    const responseData = response.data

    // Extract content array
    if (Array.isArray(responseData.content)) {
      medicalRecords = responseData.content as MedicalRecordListItem[]
    }

    // Extract pagination info
    if (typeof responseData.totalElements === 'number') {
      pagination.total = responseData.totalElements
    }
    if (typeof responseData.totalPages === 'number') {
      pagination.totalPages = responseData.totalPages
    }
    if (typeof responseData.number === 'number') {
      pagination.page = responseData.number + 1 // Convert back to 1-indexed
    }
    if (typeof responseData.size === 'number') {
      pagination.pageSize = responseData.size
    }
  } else if (isRecord(response) && Array.isArray(response.data)) {
    // Fallback: if response.data is just an array
    medicalRecords = response.data as MedicalRecordListItem[]
    pagination.total = medicalRecords.length
    pagination.totalPages = Math.ceil(medicalRecords.length / pagination.pageSize)
  }

  return { medicalRecords, pagination }
}

/**
 * Create Medical Record Request Payload
 */
export interface CreateMedicalRecordPayload {
  patientId: number
  doctorId?: number | null
  healthPlanId?: number | null
  symptoms: string
  clinicalExamination?: string | null
  diagnosis?: string | null
  treatmentPlan?: string | null
  note?: string | null
}

/**
 * Create new medical record
 * POST /api/medical-record
 */
export const createMedicalRecord = async (
  payload: CreateMedicalRecordPayload
): Promise<{
  medicalRecordId: number
  message: string
}> => {
  const { data } = await post<MedicalRecordApiResponse>('/medical-record', payload)

  const response = data ?? {}
  const recordId = typeof response.data === 'number' ? response.data : 0

  if (!recordId) {
    throw new Error('Không thể tạo phiếu khám')
  }

  return {
    medicalRecordId: recordId,
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Tạo phiếu khám thành công',
  }
}

/**
 * Get medical record by ID
 * GET /api/medical-record/{id}
 */
export const fetchMedicalRecord = async (id: number): Promise<MedicalRecord | null> => {
  const { data } = await get<MedicalRecordApiResponse>(`/medical-record/${id}`)

  const response = data ?? {}
  const recordData = isRecord(response) ? response.data : undefined

  if (isRecord(recordData)) {
    return recordData as unknown as MedicalRecord
  }

  return null
}

/**
 * Update medical record status
 * PUT /api/medical-record/status
 */
export interface UpdateMedicalRecordStatusPayload {
  id: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
}

export const updateMedicalRecordStatus = async (
  payload: UpdateMedicalRecordStatusPayload
): Promise<{ message: string }> => {
  const { data } = await put<MedicalRecordApiResponse>('/medical-record/status', payload)

  const response = data ?? {}

  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Cập nhật trạng thái thành công',
  }
}

