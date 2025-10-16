import { get, post, put } from '@/lib/api-client'
import type {
  MedicalRecord,
  MedicalRecordDetail,
  MedicalRecordStatus
} from '../types'

export type { MedicalRecordStatus, MedicalRecord, MedicalRecordDetail } from '../types'

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
  status?: MedicalRecordStatus
  limit?: number
  page?: number
}

/**
 * Fetch medical records for doctor with filters
 * GET /api/medical-record/doctor
 */
export interface FetchDoctorMedicalRecordsInput {
  keyword?: string
  date?: string // yyyy-MM-dd
  status?: MedicalRecordStatus
  isAllDepartment?: boolean // true = phiếu khám chung, false = phiếu khám của tôi
  limit?: number
  page?: number
}

export interface MedicalRecordsPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function isMedicalRecord(item: unknown): item is MedicalRecord {
  if (!isRecord(item)) return false
  return (
    typeof item.id === 'string' &&
    typeof item.code === 'string' &&
    typeof item.patientName === 'string' &&
    typeof item.date === 'string' &&
    typeof item.status === 'string'
  )
}

export const fetchMedicalRecords = async (
  input: FetchMedicalRecordsInput = {}
): Promise<{
  medicalRecords: MedicalRecord[]
  pagination: MedicalRecordsPagination
}> => {
  try {
    const params: Record<string, string> = {}

    if (input.keyword) params.keyword = input.keyword
    if (input.date) params.date = input.date
    if (input.status) params.status = input.status
    if (input.limit) params.limit = String(input.limit)
    if (input.page) params.page = String(input.page)

    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/medical-record?${queryString}` : '/medical-record'

    console.log('🔵 [fetchMedicalRecords] Requesting URL:', url)

    const { data } = await get<MedicalRecordsListApiResponse>(url)

    console.log('🔵 [fetchMedicalRecords] Raw response:', data)

    const response = data ?? {}
    let medicalRecords: MedicalRecord[] = []
    let pagination: MedicalRecordsPagination = {
      page: input.page || 1,
      pageSize: input.limit || 10,
      total: 0,
      totalPages: 0,
    }

    // Check if response has Spring Boot pagination structure
    if (isRecord(response) && isRecord(response.data)) {
      const responseData = response.data

      console.log('🔵 [fetchMedicalRecords] Response data type:', typeof responseData)
      console.log('🔵 [fetchMedicalRecords] Has content?', Array.isArray(responseData.content))

      // Extract content array
      if (Array.isArray(responseData.content)) {
        medicalRecords = responseData.content.filter(isMedicalRecord)
        console.log('🔵 [fetchMedicalRecords] Filtered records:', medicalRecords.length)
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
      console.log('🔵 [fetchMedicalRecords] Response is array format')
      medicalRecords = response.data.filter(isMedicalRecord)
      pagination.total = medicalRecords.length
      pagination.totalPages = Math.ceil(medicalRecords.length / pagination.pageSize)
    }

    console.log('🔵 [fetchMedicalRecords] Final result - Records:', medicalRecords.length, 'Pagination:', pagination)

    return { medicalRecords, pagination }
  } catch (error) {
    console.error('❌ [fetchMedicalRecords] Error:', error)
    // Return empty result instead of throwing to prevent 500 error
    return {
      medicalRecords: [],
      pagination: {
        page: input.page || 1,
        pageSize: input.limit || 10,
        total: 0,
        totalPages: 0,
      },
    }
  }
}

/**
 * Fetch medical records for doctor with filters
 * GET /api/medical-record/doctor
 */
export const fetchDoctorMedicalRecords = async (
  input: FetchDoctorMedicalRecordsInput = {}
): Promise<{
  medicalRecords: MedicalRecord[]
  pagination: MedicalRecordsPagination
}> => {
  try {
    const params: Record<string, string> = {}

    if (input.keyword) params.keyword = input.keyword
    if (input.date) params.date = input.date
    if (input.status) params.status = input.status
    if (typeof input.isAllDepartment === 'boolean') {
      params.isAllDepartment = String(input.isAllDepartment)
    }
    if (input.limit) params.limit = String(input.limit)
    if (input.page) params.page = String(input.page)

    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/medical-record/doctor?${queryString}` : '/medical-record/doctor'

    console.log('🔵 [fetchDoctorMedicalRecords] Requesting URL:', url)

    const { data } = await get<MedicalRecordsListApiResponse>(url)

    console.log('🔵 [fetchDoctorMedicalRecords] Raw response:', data)

    const response = data ?? {}
    let medicalRecords: MedicalRecord[] = []
    let pagination: MedicalRecordsPagination = {
      page: input.page || 1,
      pageSize: input.limit || 10,
      total: 0,
      totalPages: 0,
    }

    // Check if response has Spring Boot pagination structure
    if (isRecord(response) && isRecord(response.data)) {
      const responseData = response.data

      console.log('🔵 [fetchDoctorMedicalRecords] Response data type:', typeof responseData)
      console.log('🔵 [fetchDoctorMedicalRecords] Has content?', Array.isArray(responseData.content))

      // Extract content array
      if (Array.isArray(responseData.content)) {
        medicalRecords = responseData.content.filter(isMedicalRecord)
        console.log('🔵 [fetchDoctorMedicalRecords] Filtered records:', medicalRecords.length)
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
      console.log('🔵 [fetchDoctorMedicalRecords] Response is array format')
      medicalRecords = response.data.filter(isMedicalRecord)
      pagination.total = medicalRecords.length
      pagination.totalPages = Math.ceil(medicalRecords.length / pagination.pageSize)
    }

    console.log('🔵 [fetchDoctorMedicalRecords] Final result - Records:', medicalRecords.length, 'Pagination:', pagination)

    return { medicalRecords, pagination }
  } catch (error) {
    console.error('❌ [fetchDoctorMedicalRecords] Error:', error)
    // Return empty result instead of throwing to prevent 500 error
    return {
      medicalRecords: [],
      pagination: {
        page: input.page || 1,
        pageSize: input.limit || 10,
        total: 0,
        totalPages: 0,
      },
    }
  }
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
 * Get medical record by ID (with full details including invoices and lab orders)
 * GET /api/medical-record/{id}
 */
export const fetchMedicalRecordDetail = async (id: string): Promise<MedicalRecordDetail | null> => {
  const { data } = await get<MedicalRecordApiResponse>(`/medical-record/${id}`)

  const response = data ?? {}
  const recordData = isRecord(response) ? response.data : undefined

  if (isRecord(recordData)) {
    return recordData as unknown as MedicalRecordDetail
  }

  return null
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
 * Update medical record (clinical examination, diagnosis, treatment plan, note)
 * PUT /api/medical-record
 */
export interface UpdateMedicalRecordPayload {
  id: string
  symptoms?: string
  clinicalExamination?: string
  diagnosis?: string
  treatmentPlan?: string
  note?: string
}

export const updateMedicalRecord = async (
  payload: UpdateMedicalRecordPayload
): Promise<{ message: string }> => {
  const { data } = await put<MedicalRecordApiResponse>('/medical-record', payload)

  const response = data ?? {}

  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Cập nhật phiếu khám thành công',
  }
}

/**
 * Update medical record status
 * PUT /api/medical-record/status
 */
export interface UpdateMedicalRecordStatusPayload {
  id: string
  status: MedicalRecordStatus
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

/**
 * Confirm payment with cash
 * POST /api/invoices/pay-cash
 */
export interface PayCashPayload {
  medicalRecordId: number
  healthPlanIds: number[]
  totalAmount: number
}

export const payCash = async (
  payload: PayCashPayload
): Promise<{ message: string }> => {
  const { data } = await post<MedicalRecordApiResponse>('/invoices/pay-cash', payload)

  const response = data ?? {}

  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Thanh toán thành công',
  }
}

/**
 * Export invoice as HTML
 * GET /api/html/invoice/{medicalRecordId}
 */
export const exportInvoiceHtml = async (medicalRecordId: number): Promise<string> => {
  const { data } = await get<string>(`/html/invoice/${medicalRecordId}`)
  return data ?? ''
}

