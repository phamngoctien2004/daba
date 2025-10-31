/**
 * Departments List API - Admin
 * Based on actual backend endpoint
 */

import { get } from '@/lib/api-client'

export interface Department {
    id: number
    name: string
    phone: string
    description: string
}

export interface DepartmentsListParams {
    keyword?: string
    page?: number
    size?: number
}

export interface DepartmentsListResponse {
    departments: Department[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

/**
 * Check if value is a plain object
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard for Department
 */
function isDepartment(value: unknown): value is Department {
    if (!isRecord(value)) return false
    return (
        typeof value.id === 'number' &&
        typeof value.name === 'string' &&
        typeof value.phone === 'string' &&
        typeof value.description === 'string'
    )
}

/**
 * Extract pagination info from Spring Boot response
 */
function extractPagination(
    response: unknown,
    defaultPage: number,
    defaultSize: number
): DepartmentsListResponse['pagination'] {
    if (!isRecord(response)) {
        return { page: defaultPage, pageSize: defaultSize, total: 0, totalPages: 0 }
    }

    // Try Spring Boot Pageable format
    const pageable = response.pageable
    const totalPages = response.totalPages
    const totalElements = response.totalElements

    if (isRecord(pageable) && typeof totalPages === 'number' && typeof totalElements === 'number') {
        const pageNumber = typeof pageable.pageNumber === 'number' ? pageable.pageNumber + 1 : defaultPage
        const pageSize = typeof pageable.pageSize === 'number' ? pageable.pageSize : defaultSize

        return {
            page: pageNumber,
            pageSize: pageSize,
            total: totalElements,
            totalPages: totalPages,
        }
    }

    // Fallback
    return { page: defaultPage, pageSize: defaultSize, total: 0, totalPages: 0 }
}

/**
 * Fetch departments list
 */
export async function fetchDepartmentsList(
    params: DepartmentsListParams
): Promise<DepartmentsListResponse> {
    const page = params.page ?? 1
    const size = params.size ?? 10

    // Convert to Spring Boot pagination (0-indexed)
    const apiParams = {
        keyword: params.keyword,
        page: page - 1,
        size: size,
    }

    const { data } = await get<unknown>('/departments/admin', { params: apiParams })

    console.log('🔵 [fetchDepartmentsList] Raw response:', data)

    // Handle direct array response
    if (Array.isArray(data)) {
        const departments = data.filter(isDepartment)
        return {
            departments,
            pagination: {
                page,
                pageSize: size,
                total: departments.length,
                totalPages: departments.length > 0 ? 1 : 0,
            },
        }
    }

    // Handle wrapped response
    if (isRecord(data)) {
        // Check for Spring Boot Pageable structure
        const content = data.content
        if (Array.isArray(content)) {
            const departments = content.filter(isDepartment)
            const pagination = extractPagination(data, page, size)
            return { departments, pagination }
        }

        // Check for custom data wrapper
        const innerData = data.data
        if (Array.isArray(innerData)) {
            const departments = innerData.filter(isDepartment)

            // Try to extract pagination
            if (isRecord(innerData) && isRecord(innerData.pagination)) {
                const pag = innerData.pagination
                return {
                    departments,
                    pagination: {
                        page: typeof pag.page === 'number' ? pag.page : page,
                        pageSize: typeof pag.pageSize === 'number' ? pag.pageSize : size,
                        total: typeof pag.total === 'number' ? pag.total : departments.length,
                        totalPages: typeof pag.totalPages === 'number' ? pag.totalPages : 1,
                    },
                }
            }

            return {
                departments,
                pagination: {
                    page,
                    pageSize: size,
                    total: departments.length,
                    totalPages: departments.length > 0 ? 1 : 0,
                },
            }
        }

        // Check if data itself is pageable
        if (isRecord(innerData)) {
            const content = innerData.content
            if (Array.isArray(content)) {
                const departments = content.filter(isDepartment)
                const pagination = extractPagination(innerData, page, size)
                return { departments, pagination }
            }
        }
    }

    console.warn('⚠️ [fetchDepartmentsList] Unexpected response format:', data)
    return {
        departments: [],
        pagination: { page, pageSize: size, total: 0, totalPages: 0 },
    }
}
