import { get, post, put, del } from '@/lib/api-client'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

// ==================== TYPES ====================

export type LabOrderStatus = 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY'

export interface LabOrder {
  id: number
  code: string
  name: string
  doctorPerforming: string | null
  room: string
  createdAt: string
  status: LabOrderStatus
}

export interface LabOrderDetail {
  id: number
  code: string
  recordId: number
  healthPlanId: number
  healthPlanName: string
  room: string
  doctorPerformed: string | null
  doctorPerformedId: number | null
  doctorOrdered: string | null
  status: LabOrderStatus
  statusPayment: string | null
  price: number
  orderDate: string
  diagnosis: string | null
  expectedResultDate: string
  serviceParent: string | null
  labResultResponse: unknown | null
}

// ==================== GET LAB ORDERS ====================

/**
 * Get lab orders by medical record code
 * GET /api/lab-orders/code/{code}
 */
export const fetchLabOrdersByCode = async (code: string): Promise<LabOrder[]> => {
  try {
    const { data } = await get<{ data?: unknown; message?: string }>(
      `/lab-orders/code/${code}`
    )

    const response = data ?? {}
    if (isRecord(response) && Array.isArray(response.data)) {
      return response.data as LabOrder[]
    }

    return []
  } catch (error) {
    console.error('❌ [fetchLabOrdersByCode] Error:', error)
    return []
  }
}

/**
 * Get lab order detail by ID
 * GET /api/lab-orders/{id}
 */
export const fetchLabOrderDetail = async (id: number): Promise<LabOrderDetail | null> => {
  try {
    const { data } = await get<{ data?: unknown; message?: string }>(`/lab-orders/${id}`)

    const response = data ?? {}
    if (isRecord(response) && isRecord(response.data)) {
      return response.data as unknown as LabOrderDetail
    }

    return null
  } catch (error) {
    console.error('❌ [fetchLabOrderDetail] Error:', error)
    return null
  }
}

// ==================== CREATE LAB ORDER ====================

/**
 * Create new lab order
 * POST /api/lab-orders
 */
export interface CreateLabOrderPayload {
  recordId: number
  healthPlanId: number
  performingDoctor?: number | null
  diagnosis?: string | null
}

export const createLabOrder = async (
  payload: CreateLabOrderPayload
): Promise<{ message: string }> => {
  const { data } = await post<{ data?: unknown; message?: string }>(
    '/lab-orders',
    payload
  )

  const response = data ?? {}
  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Tạo chỉ định thành công',
  }
}

// ==================== UPDATE LAB ORDER STATUS ====================

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
  const { data } = await put<{ data?: unknown; message?: string }>(
    '/lab-orders/status',
    payload
  )

  const response = data ?? {}
  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Cập nhật trạng thái thành công',
  }
}

// ==================== DELETE LAB ORDER ====================

/**
 * Delete lab order by ID
 * DELETE /api/lab-orders/{id}
 */
export const deleteLabOrder = async (id: number): Promise<{ message: string }> => {
  await del(`/lab-orders/${id}`)
  return { message: 'Xóa chỉ định thành công' }
}

// ==================== GET SERVICES ====================

/**
 * Get services/health plans for lab orders
 * GET /api/services
 */
export interface Service {
  id: number
  code: string
  name: string
  price: number
  description: string | null
  roomNumber: string
  roomName: string
  type: string
}

export const fetchServices = async (keyword?: string): Promise<Service[]> => {
  try {
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    const { data } = await get<unknown>(`/services${params}`)

    if (Array.isArray(data)) {
      return data as Service[]
    }

    return []
  } catch (error) {
    console.error('❌ [fetchServices] Error:', error)
    return []
  }
}
