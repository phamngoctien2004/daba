import { get, post, put, del } from '@/lib/api-client'
import type { Service, ServiceType } from '../types'

export type { Service } from '../types'

interface ServiceApiResponse {
    data?: unknown
    message?: string
}

interface ServicesListApiResponse {
    data?: unknown
    message?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null

/**
 * Fetch services list with filters
 * GET /api/services/admin
 */
export interface FetchServicesInput {
    keyword?: string
    priceFrom?: number
    priceTo?: number
    type?: string
    limit?: number
    page?: number
}

export interface ServicesPagination {
    page: number
    pageSize: number
    total: number
    totalPages: number
}

function isService(item: unknown): item is Service {
    if (!isRecord(item)) return false
    return (
        typeof item.id === 'number' &&
        typeof item.code === 'string' &&
        typeof item.name === 'string' &&
        typeof item.price === 'number'
    )
}

export const fetchServices = async (
    input: FetchServicesInput = {}
): Promise<{
    services: Service[]
    pagination: ServicesPagination
}> => {
    try {
        const params: Record<string, string> = {}

        if (input.keyword) params.keyword = input.keyword
        if (input.priceFrom !== undefined) params.priceFrom = String(input.priceFrom)
        if (input.priceTo !== undefined) params.priceTo = String(input.priceTo)
        if (input.type) params.type = input.type
        if (input.limit) params.size = String(input.limit)
        if (input.page) params.page = String(input.page - 1) // Convert to 0-indexed

        const queryString = new URLSearchParams(params).toString()
        const url = queryString ? `/services/admin?${queryString}` : '/services/admin'

        console.log('🔵 [fetchServices] Requesting URL:', url)

        const { data } = await get<ServicesListApiResponse>(url)

        console.log('🔵 [fetchServices] Raw response:', data)

        const response = data ?? {}
        let services: Service[] = []
        let pagination: ServicesPagination = {
            page: input.page || 1,
            pageSize: input.limit || 10,
            total: 0,
            totalPages: 0,
        }

        // Check if response has Spring Boot pagination structure
        if (isRecord(response) && isRecord(response.data)) {
            const responseData = response.data

            console.log('🔵 [fetchServices] Response data type:', typeof responseData)
            console.log('🔵 [fetchServices] Has content?', Array.isArray(responseData.content))

            // Extract content array
            if (Array.isArray(responseData.content)) {
                services = responseData.content.filter(isService)
                console.log('🔵 [fetchServices] Filtered services:', services.length)
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
            console.log('🔵 [fetchServices] Response is array format')
            services = response.data.filter(isService)
            pagination.total = services.length
            pagination.totalPages = Math.ceil(services.length / pagination.pageSize)
        }

        console.log('🔵 [fetchServices] Final result - Services:', services.length, 'Pagination:', pagination)

        return { services, pagination }
    } catch (error) {
        console.error('❌ [fetchServices] Error:', error)
        // Return empty result instead of throwing to prevent 500 error
        return {
            services: [],
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
 * Get service by ID
 * GET /api/services/{id}
 */
export const fetchService = async (id: number): Promise<Service | null> => {
    const { data } = await get<ServiceApiResponse>(`/services/${id}`)

    const response = data ?? {}
    const serviceData = isRecord(response) ? response.data : undefined

    if (isRecord(serviceData)) {
        return serviceData as unknown as Service
    }

    return null
}

/**
 * Create Service Request Payload
 */
export interface CreateServicePayload {
    code: string
    name: string
    price: number
    description?: string | null
    roomNumber: string
    roomName: string
    type: ServiceType
}

/**
 * Create new service
 * POST /api/services
 */
export const createService = async (
    payload: CreateServicePayload
): Promise<{
    service: Service
    message: string
}> => {
    const { data } = await post<ServiceApiResponse>('/services', payload)

    const response = data ?? {}
    const serviceInfo = isRecord(response.data) ? response.data : {}

    if (!isRecord(serviceInfo) || typeof serviceInfo.id !== 'number') {
        throw new Error('Không thể tạo dịch vụ')
    }

    return {
        service: serviceInfo as unknown as Service,
        message:
            isRecord(response) && typeof response.message === 'string'
                ? response.message
                : 'Tạo dịch vụ thành công',
    }
}

/**
 * Update service
 * PUT /api/services
 */
export interface UpdateServicePayload {
    id: number
    code: string
    name: string
    price: number
    description?: string | null
    roomNumber: string
    roomName: string
    type: ServiceType
}

export const updateService = async (
    payload: UpdateServicePayload
): Promise<{ message: string }> => {
    const { data } = await put<ServiceApiResponse>('/services', payload)

    const response = data ?? {}

    return {
        message:
            isRecord(response) && typeof response.message === 'string'
                ? response.message
                : 'Cập nhật dịch vụ thành công',
    }
}

/**
 * Delete service
 * DELETE /api/services/{id}
 */
export const deleteService = async (id: number): Promise<{ message: string }> => {
    const { data } = await del<ServiceApiResponse>(`/services/${id}`)

    const response = data ?? {}

    return {
        message:
            isRecord(response) && typeof response.message === 'string'
                ? response.message
                : 'Xóa dịch vụ thành công',
    }
}
