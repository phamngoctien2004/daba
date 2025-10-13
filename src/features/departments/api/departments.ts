import { get } from '@/lib/api-client'

export interface Department {
  id: number
  name: string
  description?: string
}

interface DepartmentsApiResponse {
  data?: unknown
  message?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isDepartmentArray = (value: unknown): value is Department[] =>
  Array.isArray(value)

/**
 * Get all departments
 * GET /api/departments
 */
export const fetchDepartments = async (): Promise<Department[]> => {
  const { data } = await get<DepartmentsApiResponse>('/departments')

  const response = data ?? {}
  const rawData = isRecord(response) ? response.data : undefined

  if (isDepartmentArray(rawData)) {
    return rawData
  }

  return []
}

export interface Doctor {
  id: number
  name: string
  position?: string
  specialization?: string
  phone?: string
  email?: string
  available?: boolean
  examinationFee?: number
}

interface DoctorsByDepartmentApiResponse {
  data?: unknown
  message?: string
}

const isDoctorArray = (value: unknown): value is Doctor[] =>
  Array.isArray(value)

/**
 * Get doctors by department
 * GET /api/departments/{id}/doctors
 */
export const fetchDoctorsByDepartment = async (
  departmentId: number
): Promise<Doctor[]> => {
  const { data } = await get<DoctorsByDepartmentApiResponse>(
    `/departments/${departmentId}/doctors`
  )

  const response = data ?? {}
  const rawData = isRecord(response) ? response.data : undefined

  if (isDoctorArray(rawData)) {
    return rawData
  }

  return []
}
