/**
 * Service CRUD API Client
 */

import { get, post, put, del } from '@/lib/api-client'
import type {
    ServiceDetail,
    CreateServiceRequest,
    CreateServiceResponse,
    UpdateServiceRequest,
    UpdateServiceResponse,
    Service,
    ServiceParameter,
} from '../types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null

/**
 * Get service detail by ID
 * GET /api/services/optional/{id}
 */
export async function fetchServiceDetail(id: number): Promise<ServiceDetail | null> {
    const response = await get<{ data: ServiceDetail } | ServiceDetail>(`/services/optional/${id}`)
    console.log('🔵 [fetchServiceDetail] Raw response:', response.data)

    const data = response.data
    if (!data) return null

    // Response có thể bọc trong data property
    if (isRecord(data) && 'data' in data && isRecord(data.data)) {
        const innerData = data.data
        if (typeof innerData.id === 'number' && typeof innerData.name === 'string') {
            return innerData as ServiceDetail
        }
    }

    // Hoặc trả về trực tiếp object ServiceDetail
    if (isRecord(data) && 'id' in data && 'name' in data) {
        if (typeof data.id === 'number' && typeof data.name === 'string') {
            return data as unknown as ServiceDetail
        }
    }

    return null
}

/**
 * Search services for selection (dùng khi chọn dịch vụ con trong gói)
 * GET /api/services?keyword={keyword}
 */
export interface SearchServicesInput {
    keyword?: string
}

export async function searchServicesForSelection(input: SearchServicesInput = {}): Promise<Service[]> {
    try {
        const params: Record<string, string> = {}
        if (input.keyword) params.keyword = input.keyword

        const queryString = new URLSearchParams(params).toString()
        const url = queryString ? `/services?${queryString}` : '/services'

        console.log('🔵 [searchServicesForSelection] Requesting URL:', url)

        const { data } = await get<Service[] | { data: Service[] }>(url)
        console.log('🔵 [searchServicesForSelection] Raw response:', data)

        // Handle both array and wrapped response
        let rawServices: unknown[] = []
        if (Array.isArray(data)) {
            rawServices = data
        } else if (isRecord(data) && Array.isArray(data.data)) {
            rawServices = data.data
        }

        // Filter valid services - LOẠI TRỪ type = DICH_VU (vì đó là gói, không phải dịch vụ đơn)
        // Chỉ lấy XET_NGHIEM hoặc KHAC
        return rawServices.filter((item): item is Service =>
            isRecord(item) &&
            typeof item.id === 'number' &&
            typeof item.name === 'string' &&
            item.type !== 'DICH_VU'
        )
    } catch (error) {
        console.error('❌ [searchServicesForSelection] Error:', error)
        return []
    }
}

/**
 * Get all parameters
 * GET /api/params?keyword={keyword}
 */
export interface SearchParametersInput {
    keyword?: string
}

export async function searchParameters(input: SearchParametersInput = {}): Promise<ServiceParameter[]> {
    try {
        const params: Record<string, string> = {}
        if (input.keyword) params.keyword = input.keyword

        const queryString = new URLSearchParams(params).toString()
        const url = queryString ? `/params?${queryString}` : '/params'

        console.log('🔵 [searchParameters] Requesting URL:', url)

        const { data } = await get<{ data: ServiceParameter[] } | ServiceParameter[]>(url)
        console.log('🔵 [searchParameters] Raw response:', data)

        // Handle both array and wrapped response
        if (Array.isArray(data)) {
            return data.filter((item): item is ServiceParameter =>
                isRecord(item) &&
                typeof item.id === 'number' &&
                typeof item.name === 'string'
            )
        } else if (isRecord(data) && Array.isArray(data.data)) {
            return data.data.filter((item): item is ServiceParameter =>
                isRecord(item) &&
                typeof item.id === 'number' &&
                typeof item.name === 'string'
            )
        }

        return []
    } catch (error) {
        console.error('❌ [searchParameters] Error:', error)
        return []
    }
}

/**
 * Get parameters by health plan ID
 * GET /api/services/params/{healthPlanId}
 */
export async function fetchServiceParameters(healthPlanId: number): Promise<ServiceParameter[]> {
    try {
        const { data } = await get<{ data: ServiceParameter[] }>(`/services/params/${healthPlanId}`)
        console.log('🔵 [fetchServiceParameters] Raw response:', data)

        if (isRecord(data) && Array.isArray(data.data)) {
            return data.data.filter((item): item is ServiceParameter =>
                isRecord(item) &&
                typeof item.id === 'number' &&
                typeof item.name === 'string'
            )
        }

        return []
    } catch (error) {
        console.error('❌ [fetchServiceParameters] Error:', error)
        return []
    }
}

/**
 * Create new service
 * POST /api/services
 */
export async function createService(request: CreateServiceRequest): Promise<ServiceDetail> {
    const response = await post<CreateServiceResponse>('/services', request)
    console.log('🔵 [createService] Raw response:', response.data)

    const data = response.data ?? {}
    if (isRecord(data) && isRecord(data.data)) {
        return data.data as ServiceDetail
    }

    throw new Error('Không thể tạo dịch vụ')
}

/**
 * Update service
 * PUT /api/services
 */
export async function updateService(request: UpdateServiceRequest): Promise<ServiceDetail> {
    const response = await put<UpdateServiceResponse>('/services', request)
    console.log('🔵 [updateService] Raw response:', response.data)

    const data = response.data ?? {}
    if (isRecord(data) && isRecord(data.data)) {
        return data.data as ServiceDetail
    }

    throw new Error('Không thể cập nhật dịch vụ')
}

/**
 * Delete service
 * DELETE /api/services/{id}
 */
export async function deleteService(id: number): Promise<void> {
    await del(`/services/${id}`)
    console.log('🔵 [deleteService] Service deleted successfully')
}

/**
 * Add parameters to service
 * PUT /api/services/params
 */
export interface AddParametersRequest {
    healthPlanId: number
    requestIds: number[]
}

export async function addParametersToService(request: AddParametersRequest): Promise<void> {
    await put('/services/params', request)
    console.log('🔵 [addParametersToService] Parameters added successfully')
}

/**
 * Delete parameters from service
 * DELETE /api/services/params
 */
export interface DeleteParametersRequest {
    healthPlanId: number
    requestIds: number[]
}

export async function deleteParametersFromService(request: DeleteParametersRequest): Promise<void> {
    await del('/services/params', { data: request })
    console.log('🔵 [deleteParametersFromService] Parameters deleted successfully')
}
