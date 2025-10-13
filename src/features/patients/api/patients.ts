import { get, post } from '@/lib/api-client'

export interface Patient {
  id: number
  name: string
  phone?: string
  email?: string
  gender: 'NAM' | 'NU'
  birth: string // YYYY-MM-DD
  address?: string
  cccd?: string
  bhyt?: string
}

interface PatientsApiResponse {
  data?: unknown
  message?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isPatientArray = (value: unknown): value is Patient[] =>
  Array.isArray(value)

/**
 * Search patients by keyword
 * GET /api/patients?keyword={keyword}
 */
export const searchPatients = async (keyword: string): Promise<Patient[]> => {
  const { data } = await get<PatientsApiResponse>('/patients', {
    params: { keyword },
  })

  const response = data ?? {}
  const rawData = isRecord(response) ? response.data : undefined

  if (isPatientArray(rawData)) {
    return rawData
  }

  return []
}

/**
 * Create Patient Request Payload
 */
export interface CreatePatientPayload {
  name: string
  phone?: string
  email?: string
  gender: 'NAM' | 'NU'
  birth: string // YYYY-MM-DD
  address?: string
  cccd?: string
  bhyt?: string
}

interface CreatePatientApiResponse {
  data?: unknown
  message?: string
}

/**
 * Create new patient
 * POST /api/patients
 */
export const createPatient = async (
  payload: CreatePatientPayload
): Promise<{
  patient?: Patient
  message: string
}> => {
  const { data } = await post<CreatePatientApiResponse>('/patients', payload)

  const response = data ?? {}
  const patientData = isRecord(response) ? response.data : undefined

  return {
    patient: isRecord(patientData)
      ? (patientData as unknown as Patient)
      : undefined,
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Tạo bệnh nhân thành công',
  }
}
