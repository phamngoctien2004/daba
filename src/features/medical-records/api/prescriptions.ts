import { get, post, put, del } from '@/lib/api-client'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

// ==================== TYPES ====================

export interface Medicine {
  id: number
  name: string | null
  concentration: string | null
  dosageForm: string | null
  description: string | null
  unit: string | null
}

export interface PrescriptionDetail {
  id: number
  medicineResponse: Medicine
  usageInstructions: string
  quantity: number
}

export interface Prescription {
  id: number
  code: string
  generalInstructions: string | null
  doctorCreated: string
  prescriptionDate: string
  detailResponses: PrescriptionDetail[]
  // Legacy fields for backward compatibility
  note?: string | null
  createdDate?: string
  details?: PrescriptionDetail[]
}

// ==================== GET PRESCRIPTIONS ====================

/**
 * Get prescriptions by medical record ID
 * GET /api/prescriptions/medical-record/{id}
 * 
 * API Note: Returns a single prescription object (not an array)
 */
export const fetchPrescriptionsByMedicalRecord = async (
  medicalRecordId: string
): Promise<Prescription[]> => {
  try {
    console.log('🔵 [fetchPrescriptionsByMedicalRecord] Fetching for ID:', medicalRecordId)
    const { data } = await get<{ data?: unknown; message?: string }>(
      `/prescriptions/medical-record/${medicalRecordId}`
    )

    console.log('🔵 [fetchPrescriptionsByMedicalRecord] Raw response:', data)

    const response = data ?? {}

    // API returns a single prescription object in response.data
    if (isRecord(response) && isRecord(response.data)) {
      const prescription = response.data as unknown as Prescription
      console.log('🔵 [fetchPrescriptionsByMedicalRecord] Found prescription:', prescription.id)
      return [prescription] // Wrap in array for consistency
    }

    console.log('🔵 [fetchPrescriptionsByMedicalRecord] No prescription found')
    return []
  } catch (error) {
    console.error('❌ [fetchPrescriptionsByMedicalRecord] Error:', error)
    return []
  }
}

// ==================== CREATE PRESCRIPTION ====================

/**
 * Create new prescription
 * POST /api/prescriptions
 */
export interface CreatePrescriptionPayload {
  medicalRecordId: number
  note?: string | null
}

export const createPrescription = async (
  payload: CreatePrescriptionPayload
): Promise<{ id: number; message: string }> => {
  const { data } = await post<{ data?: unknown; message?: string }>(
    '/prescriptions',
    payload
  )

  const response = data ?? {}
  const prescriptionData = isRecord(response) && isRecord(response.data) ? response.data : {}

  if (typeof prescriptionData.id !== 'number') {
    throw new Error('Không thể tạo đơn thuốc')
  }

  return {
    id: prescriptionData.id,
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Tạo đơn thuốc thành công',
  }
}

// ==================== UPDATE PRESCRIPTION ====================

/**
 * Update prescription note
 * PUT /api/prescriptions
 */
export interface UpdatePrescriptionPayload {
  id: number
  note: string
}

export const updatePrescription = async (
  payload: UpdatePrescriptionPayload
): Promise<{ message: string }> => {
  const { data } = await put<{ data?: unknown; message?: string }>(
    '/prescriptions',
    payload
  )

  const response = data ?? {}
  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Cập nhật đơn thuốc thành công',
  }
}

// ==================== ADD PRESCRIPTION DETAIL ====================

/**
 * Add medicine to prescription
 * POST /api/prescriptions/details
 */
export interface AddPrescriptionDetailPayload {
  prescriptionId: number
  medicineId: number
  usageInstructions: string
  quantity: number
}

export const addPrescriptionDetail = async (
  payload: AddPrescriptionDetailPayload
): Promise<{ detail: PrescriptionDetail; message: string }> => {
  const { data } = await post<{ data?: unknown; message?: string }>(
    '/prescriptions/details',
    payload
  )

  const response = data ?? {}
  const detailData = isRecord(response) ? response.data : {}

  return {
    detail: detailData as PrescriptionDetail,
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Thêm thuốc thành công',
  }
}

// ==================== UPDATE PRESCRIPTION DETAIL ====================

/**
 * Update prescription detail
 * PUT /api/prescriptions/details
 */
export interface UpdatePrescriptionDetailPayload {
  id: number
  medicineId: number
  usageInstructions: string
  quantity: number
}

export const updatePrescriptionDetail = async (
  payload: UpdatePrescriptionDetailPayload
): Promise<{ message: string }> => {
  const { data } = await put<{ data?: unknown; message?: string }>(
    '/prescriptions/details',
    payload
  )

  const response = data ?? {}
  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Cập nhật thuốc thành công',
  }
}

// ==================== DELETE PRESCRIPTION DETAIL ====================

/**
 * Delete prescription detail
 * DELETE /api/prescriptions/details/{id}
 */
export const deletePrescriptionDetail = async (id: number): Promise<{ message: string }> => {
  await del(`/prescriptions/details/${id}`)
  return { message: 'Xóa thuốc thành công' }
}

// ==================== GET MEDICINES ====================

/**
 * Get medicines list with search and pagination
 * GET /api/medicines?keyword=xxx&page=1&limit=10
 */
export interface FetchMedicinesParams {
  keyword?: string
  page?: number
  limit?: number
}

export const fetchMedicines = async (params?: FetchMedicinesParams): Promise<Medicine[]> => {
  try {
    const queryParams = new URLSearchParams()
    if (params?.keyword) queryParams.append('keyword', params.keyword)
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.limit) queryParams.append('limit', String(params.limit))

    const queryString = queryParams.toString()
    const url = `/medicines${queryString ? `?${queryString}` : ''}`

    console.log('🔵 [fetchMedicines] Fetching with params:', params)
    const { data } = await get<{ data?: unknown; message?: string }>(url)

    console.log('🔵 [fetchMedicines] Raw response:', data)

    const response = data ?? {}

    // API returns paginated response: {data: {content: [...], ...}}
    if (isRecord(response) && isRecord(response.data)) {
      const paginatedData = response.data
      if (isRecord(paginatedData) && Array.isArray(paginatedData.content)) {
        console.log('🔵 [fetchMedicines] Found medicines:', paginatedData.content.length)
        return paginatedData.content as Medicine[]
      }
    }

    // Fallback for old API format: {data: [...]}
    if (isRecord(response) && Array.isArray(response.data)) {
      return response.data as Medicine[]
    }

    console.log('🔵 [fetchMedicines] No medicines found')
    return []
  } catch (error) {
    console.error('❌ [fetchMedicines] Error:', error)
    return []
  }
}
