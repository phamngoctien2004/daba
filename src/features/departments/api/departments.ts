import { get } from '@/lib/api-client'

export interface Department {
  id: number
  name: string
  phone?: string
  description?: string
}

const isDepartment = (value: unknown): value is Department => {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return typeof obj.id === 'number' && typeof obj.name === 'string'
}

/**
 * Get all departments
 * GET /api/departments
 * Response: Array of departments (not wrapped in {data: ...})
 */
export const fetchDepartments = async (): Promise<Department[]> => {
  console.log('🔵 [fetchDepartments] Calling API: GET /departments')

  const { data } = await get<Department[]>('/departments')

  console.log('🔵 [fetchDepartments] Raw response:', data)
  console.log('🔵 [fetchDepartments] Is array?', Array.isArray(data))

  if (Array.isArray(data)) {
    const departments = data.filter(isDepartment)
    console.log('✅ [fetchDepartments] Returning departments:', departments.length, 'from', data.length)
    return departments
  }

  console.warn('⚠️ [fetchDepartments] Returning empty array - response is not an array')
  return []
}

export interface Doctor {
  id: number
  fullName?: string // New field from API
  name?: string // Keep for backward compatibility
  position?: string
  specialization?: string
  phone?: string
  email?: string
  available?: boolean
  examinationFee?: number
  roomNumber?: string
  roomName?: string
}

interface DoctorsApiResponse {
  data?: unknown
  message?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isDoctor = (value: unknown): value is Doctor => {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.id === 'number' &&
    (typeof obj.fullName === 'string' ||
      typeof obj.name === 'string' ||
      typeof obj.position === 'string')
  )
}

/**
 * Get all doctors
 * GET /api/doctors
 * Response: {data: Doctor[], message: string}
 */
export const fetchAllDoctors = async (): Promise<Doctor[]> => {
  console.log('🟡 [fetchAllDoctors] Calling API: GET /doctors')

  const { data } = await get<DoctorsApiResponse>('/doctors')

  console.log('🟡 [fetchAllDoctors] Raw response:', data)

  const response = data ?? {}
  const rawData = isRecord(response) ? response.data : undefined
  console.log('🟡 [fetchAllDoctors] Extracted data:', rawData)
  console.log('🟡 [fetchAllDoctors] Is array?', Array.isArray(rawData))

  if (Array.isArray(rawData)) {
    const doctors = rawData.filter(isDoctor)
    console.log('✅ [fetchAllDoctors] Returning doctors:', doctors.length, 'from', rawData.length)
    return doctors
  }

  console.warn('⚠️ [fetchAllDoctors] Returning empty array - data validation failed')
  return []
}

/**
 * Get doctors by department
 * GET /api/departments/{id}/doctors
 * Response: Array of doctors (not wrapped in {data: ...})
 */
export const fetchDoctorsByDepartment = async (
  departmentId: number
): Promise<Doctor[]> => {
  console.log(`🟣 [fetchDoctorsByDepartment] Calling API: GET /departments/${departmentId}/doctors`)

  const { data } = await get<Doctor[]>(
    `/departments/${departmentId}/doctors`
  )

  console.log('🟣 [fetchDoctorsByDepartment] Raw response:', data)
  console.log('🟣 [fetchDoctorsByDepartment] Is array?', Array.isArray(data))

  if (Array.isArray(data)) {
    const doctors = data.filter(isDoctor)
    console.log('✅ [fetchDoctorsByDepartment] Returning doctors:', doctors.length, doctors)
    return doctors
  }

  console.warn('⚠️ [fetchDoctorsByDepartment] Returning empty array - response is not an array')
  return []
}
