import { get, post, put } from '@/lib/api-client'
import type { Patient } from '../types'

export type { Patient } from '../types'

interface PatientApiResponse {
  data?: unknown
  message?: string
}

interface PatientsListApiResponse {
  data?: unknown
  message?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Fetch patients list with filters
 * GET /api/patients
 */
export interface FetchPatientsInput {
  keyword?: string
  limit?: number
  page?: number
}

export interface PatientsPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function isPatient(item: unknown): item is Patient {
  if (!isRecord(item)) return false
  return (
    typeof item.id === 'number' &&
    typeof item.code === 'string' &&
    typeof item.fullName === 'string' &&
    typeof item.gender === 'string'
  )
}

export const fetchPatients = async (
  input: FetchPatientsInput = {}
): Promise<{
  patients: Patient[]
  pagination: PatientsPagination
}> => {
  try {
    const params: Record<string, string> = {}

    if (input.keyword) params.keyword = input.keyword
    if (input.limit) params.limit = String(input.limit)
    if (input.page) params.page = String(input.page)

    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/patients?${queryString}` : '/patients'

    console.log('🔵 [fetchPatients] Requesting URL:', url)

    const { data } = await get<PatientsListApiResponse>(url)

    console.log('🔵 [fetchPatients] Raw response:', data)

    const response = data ?? {}
    let patients: Patient[] = []
    let pagination: PatientsPagination = {
      page: input.page || 1,
      pageSize: input.limit || 10,
      total: 0,
      totalPages: 0,
    }

    // Check if response has Spring Boot pagination structure
    if (isRecord(response) && isRecord(response.data)) {
      const responseData = response.data

      console.log('🔵 [fetchPatients] Response data type:', typeof responseData)
      console.log('🔵 [fetchPatients] Has content?', Array.isArray(responseData.content))

      // Extract content array
      if (Array.isArray(responseData.content)) {
        patients = responseData.content.filter(isPatient)
        console.log('🔵 [fetchPatients] Filtered patients:', patients.length)
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
      console.log('🔵 [fetchPatients] Response is array format')
      patients = response.data.filter(isPatient)
      pagination.total = patients.length
      pagination.totalPages = Math.ceil(patients.length / pagination.pageSize)
    }

    console.log('🔵 [fetchPatients] Final result - Patients:', patients.length, 'Pagination:', pagination)

    return { patients, pagination }
  } catch (error) {
    console.error('❌ [fetchPatients] Error:', error)
    // Return empty result instead of throwing to prevent 500 error
    return {
      patients: [],
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
 * Get patient by ID
 * GET /api/patients/{id}
 */
export const fetchPatient = async (id: number): Promise<Patient | null> => {
  const { data } = await get<PatientApiResponse>(`/patients/${id}`)

  const response = data ?? {}
  const patientData = isRecord(response) ? response.data : undefined

  if (isRecord(patientData)) {
    return patientData as unknown as Patient
  }

  return null
}

/**
 * Create Patient Request Payload
 */
export interface CreatePatientPayload {
  fullName: string
  phone: string | null
  phoneLink: string | null
  email: string | null
  gender: 'NAM' | 'NU'
  birth: string // yyyy-MM-dd
  address: string | null
  cccd: string | null
  bloodType?: string | null
  weight?: number | null
  height?: number | null
  profileImage?: string | null
}

/**
 * Create new patient
 * POST /api/patients
 */
export const createPatient = async (
  payload: CreatePatientPayload
): Promise<{
  patient: Patient
  message: string
}> => {
  const { data } = await post<PatientApiResponse>('/patients', payload)

  const response = data ?? {}
  const patientInfo = isRecord(response.data) ? response.data : {}

  if (!isRecord(patientInfo) || typeof patientInfo.id !== 'number') {
    throw new Error('Không thể tạo bệnh nhân')
  }

  return {
    patient: patientInfo as unknown as Patient,
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Tạo bệnh nhân thành công',
  }
}

/**
 * Update patient
 * PUT /api/patients
 */
export interface UpdatePatientPayload {
  id: number
  fullName: string
  phone: string | null
  phoneLink?: string | null
  email: string | null
  gender: 'NAM' | 'NU'
  birth: string // yyyy-MM-dd
  address: string | null
  cccd: string | null
  bloodType?: string | null
  weight?: number | null
  height?: number | null
  profileImage?: string | null
}

export const updatePatient = async (
  payload: UpdatePatientPayload
): Promise<{ message: string }> => {
  const { data } = await put<PatientApiResponse>('/patients', payload)

  const response = data ?? {}

  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Cập nhật bệnh nhân thành công',
  }
}
