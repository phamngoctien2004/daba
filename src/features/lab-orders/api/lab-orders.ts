import { get, post, put, del } from '@/lib/api-client'
import type { 
  LabOrder, 
  LabOrderStatus, 
  LabOrdersPagination,
  LabParam,
  LabResultDetailParam,
  CreateLabResultDetailsPayload,
  LabResultDetail
} from '../types'

export type { LabOrder, LabOrderStatus } from '../types'

interface LabOrdersApiResponse {
  data?: unknown
  message?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

function isLabOrder(item: unknown): item is LabOrder {
  if (!isRecord(item)) return false
  return (
    typeof item.id === 'number' &&
    typeof item.code === 'string' &&
    typeof item.healthPlanName === 'string' &&
    typeof item.status === 'string'
  )
}

/**
 * Fetch lab orders for doctor with filters
 * GET /api/lab-orders/doctor
 */
export interface FetchLabOrdersInput {
  keyword?: string
  date?: string // yyyy-MM-dd
  status?: LabOrderStatus
  limit?: number
  page?: number
}

export const fetchDoctorLabOrders = async (
  input: FetchLabOrdersInput = {}
): Promise<{
  labOrders: LabOrder[]
  pagination: LabOrdersPagination
}> => {
  try {
    const params: Record<string, string> = {}

    if (input.keyword) params.keyword = input.keyword
    if (input.date) params.date = input.date
    if (input.status) params.status = input.status
    if (input.limit) params.limit = String(input.limit)
    if (input.page) params.page = String(input.page)

    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/lab-orders/doctor?${queryString}` : '/lab-orders/doctor'

    console.log('🔬 [fetchDoctorLabOrders] Requesting URL:', url)

    const { data } = await get<LabOrdersApiResponse>(url)

    console.log('🔬 [fetchDoctorLabOrders] Raw response:', data)

    const response = data ?? {}
    let labOrders: LabOrder[] = []
    let pagination: LabOrdersPagination = {
      page: input.page || 1,
      pageSize: input.limit || 10,
      total: 0,
      totalPages: 0,
    }

    // Check if response has Spring Boot pagination structure
    if (isRecord(response) && isRecord(response.data)) {
      const responseData = response.data

      // Extract content array
      if (Array.isArray(responseData.content)) {
        labOrders = responseData.content.filter(isLabOrder)
        console.log('🔬 [fetchDoctorLabOrders] Filtered orders:', labOrders.length)
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
      console.log('🔬 [fetchDoctorLabOrders] Response is array format')
      labOrders = response.data.filter(isLabOrder)
      pagination.total = labOrders.length
      pagination.totalPages = Math.ceil(labOrders.length / pagination.pageSize)
    }

    console.log('🔬 [fetchDoctorLabOrders] Final result - Orders:', labOrders.length, 'Pagination:', pagination)

    return { labOrders, pagination }
  } catch (error) {
    console.error('❌ [fetchDoctorLabOrders] Error:', error)
    return {
      labOrders: [],
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
 * Get lab order by ID
 * GET /api/lab-orders/{id}
 */
export const fetchLabOrderById = async (id: number): Promise<LabOrder | null> => {
  try {
    const { data } = await get<LabOrdersApiResponse>(`/lab-orders/${id}`)

    const response = data ?? {}
    const orderData = isRecord(response) ? response.data : undefined

    if (isRecord(orderData)) {
      return orderData as unknown as LabOrder
    }

    return null
  } catch (error) {
    console.error('❌ [fetchLabOrderById] Error:', error)
    return null
  }
}

/**
 * Update lab order status
 * PUT /api/lab-orders/status
 */
export interface UpdateLabOrderStatusPayload {
  id: number
  status: LabOrderStatus
}

export const updateLabOrderStatus = async (
  payload: UpdateLabOrderStatusPayload
): Promise<{ message: string }> => {
  const { data } = await put<LabOrdersApiResponse>('/lab-orders/status', payload)

  const response = data ?? {}

  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Cập nhật trạng thái thành công',
  }
}

/**
 * Update lab order (assign performing doctor)
 * PUT /api/lab-orders
 */
export interface UpdateLabOrderPayload {
  id: number
  doctorPerformingId: number | null
}

export const updateLabOrder = async (
  payload: UpdateLabOrderPayload
): Promise<{ message: string }> => {
  const { data } = await put<LabOrdersApiResponse>('/lab-orders', payload)

  const response = data ?? {}

  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Cập nhật phiếu xét nghiệm thành công',
  }
}

/**
 * Process lab order (marks as "in progress")
 * GET /api/lab-orders/processing/{id}
 */
export const processLabOrder = async (id: number): Promise<LabOrder> => {
  const { data } = await get<LabOrdersApiResponse>(`/lab-orders/processing/${id}`)

  const response = data ?? {}
  const orderData = isRecord(response) ? response.data : undefined

  if (isRecord(orderData) && isLabOrder(orderData)) {
    return orderData
  }

  throw new Error('Invalid response format')
}

/**
 * Create lab result
 * POST /api/lab-results
 */
export interface CreateLabResultPayload {
  labOrderId: number
  resultDetails: string
  note?: string
  summary?: string
  explanation?: string
}

export interface LabResultResponse {
  id: number
  date: string
  status: string
  resultDetails: string
  note: string | null
  explanation: string | null
  isDone?: boolean
}

export const createLabResult = async (
  payload: CreateLabResultPayload
): Promise<LabResultResponse> => {
  const { data } = await post<LabOrdersApiResponse>('/lab-results', payload)

  const response = data ?? {}
  const resultData = isRecord(response) ? response.data : undefined

  if (isRecord(resultData)) {
    return resultData as unknown as LabResultResponse
  }

  throw new Error('Invalid response format')
}

/**
 * Update lab result
 * PUT /api/lab-results
 */
export interface UpdateLabResultPayload {
  labOrderId: number
  resultDetails: string
  note?: string
  summary?: string
  explanation?: string
  isDone?: boolean
}

export const updateLabResult = async (
  payload: UpdateLabResultPayload
): Promise<LabResultResponse> => {
  const { data } = await put<LabOrdersApiResponse>('/lab-results', payload)

  const response = data ?? {}
  const resultData = isRecord(response) ? response.data : undefined

  if (isRecord(resultData)) {
    return resultData as unknown as LabResultResponse
  }

  throw new Error('Invalid response format')
}

/**
 * Delete lab order
 * DELETE /api/lab-orders/{id}
 */
export const deleteLabOrder = async (id: number): Promise<{ message: string }> => {
  await del(`/lab-orders/${id}`)

  return {
    message: 'Xóa phiếu xét nghiệm thành công',
  }
}

/**
 * Get lab order params
 * GET /api/lab-orders/{id}/params
 */
export const fetchLabOrderParams = async (labOrderId: number): Promise<LabParam[]> => {
  try {
    const { data } = await get<LabOrdersApiResponse>(`/lab-orders/${labOrderId}/params`)

    console.log('🔬 [fetchLabOrderParams] Raw response:', data)

    const response = data ?? {}
    const paramsData = isRecord(response) ? response.data : undefined

    if (Array.isArray(paramsData)) {
      return paramsData.filter((item): item is LabParam => {
        if (!isRecord(item)) return false
        return (
          typeof item.id === 'number' &&
          typeof item.name === 'string' &&
          typeof item.unit === 'string' &&
          typeof item.range === 'string'
        )
      })
    }

    console.log('⚠️ [fetchLabOrderParams] Invalid response format')
    return []
  } catch (error) {
    console.error('❌ [fetchLabOrderParams] Error:', error)
    return []
  }
}

/**
 * Create lab result details
 * POST /api/lab-results/details
 */
export const createLabResultDetails = async (
  payload: CreateLabResultDetailsPayload
): Promise<{ message: string }> => {
  const { data } = await post<LabOrdersApiResponse>('/lab-results/details', payload)

  const response = data ?? {}

  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Tạo chi tiết kết quả xét nghiệm thành công',
  }
}

/**
 * Get lab result details
 * GET /api/lab-results/{id}/details
 */
export const fetchLabResultDetails = async (labResultId: number): Promise<LabResultDetail[]> => {
  try {
    const { data } = await get<LabOrdersApiResponse>(`/lab-results/${labResultId}/details`)

    console.log('🔬 [fetchLabResultDetails] Raw response:', data)

    const response = data ?? {}
    const detailsData = isRecord(response) ? response.data : undefined

    if (Array.isArray(detailsData)) {
      return detailsData.filter((item): item is LabResultDetail => {
        if (!isRecord(item)) return false
        return (
          typeof item.id === 'number' &&
          typeof item.name === 'string' &&
          typeof item.value === 'string' &&
          typeof item.unit === 'string' &&
          typeof item.range === 'string' &&
          typeof item.rangeStatus === 'string'
        )
      })
    }

    console.log('⚠️ [fetchLabResultDetails] Invalid response format')
    return []
  } catch (error) {
    console.error('❌ [fetchLabResultDetails] Error:', error)
    return []
  }
}

/**
 * Complete lab order (hoàn thành xét nghiệm)
 * PUT /api/lab-orders/complete
 */
export interface CompleteLabOrderPayload {
  labOrderId: number
  resultDetails: string
  note?: string
  explaination?: string  // Backend uses 'explaination' (typo in API)
  summary?: string
  urls?: string[]  // URLs của ảnh kết quả xét nghiệm
  paramDetails: LabResultDetailParam[]
}

export const completeLabOrder = async (
  payload: CompleteLabOrderPayload
): Promise<{ message: string }> => {
  const { data } = await put<LabOrdersApiResponse>('/lab-orders/complete', payload)

  const response = data ?? {}

  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Hoàn thành xét nghiệm thành công',
  }
}

/**
 * Upload multiple images for lab result
 * POST /api/files/multiple
 */
export interface UploadImagesResponse {
  data: string[]  // Array of image URLs
  message: string
}

export const uploadLabResultImages = async (files: File[]): Promise<string[]> => {
  try {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('type', 'xn')  // Type for lab result images

    console.log('📤 [uploadLabResultImages] Uploading', files.length, 'files')

    const { data } = await post<UploadImagesResponse>('/files/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    console.log('📤 [uploadLabResultImages] Response:', data)

    const response = data ?? {}
    const urls = isRecord(response) && Array.isArray(response.data) ? response.data : []

    return urls
  } catch (error) {
    console.error('❌ [uploadLabResultImages] Error:', error)
    throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.')
  }
}