/**
 * Users Management API
 */

import { get, post, del } from '@/lib/api-client'
import type { UserRole } from '../types'

export interface User {
    id: number
    email: string
    name: string
    role: UserRole
    status?: boolean
    createdAt?: string
}

export interface UsersListParams {
    keyword?: string
    role?: UserRole[]
    page?: number
    size?: number
}

export interface UsersListResponse {
    users: User[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

export interface CreateUserData {
    username: string
    password: string
    email: string
    role: UserRole
    name: string
}

/**
 * Check if value is a plain object
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard for User
 */
function isUser(value: unknown): value is User {
    if (!isRecord(value)) return false
    return (
        typeof value.id === 'number' &&
        typeof value.email === 'string' &&
        typeof value.role === 'string'
    )
}

/**
 * Extract pagination info from Spring Boot response
 */
function extractPagination(
    response: unknown,
    defaultPage: number,
    defaultSize: number
): UsersListResponse['pagination'] {
    if (!isRecord(response)) {
        return { page: defaultPage, pageSize: defaultSize, total: 0, totalPages: 0 }
    }

    const pageable = response.pageable
    const totalPages = response.totalPages
    const totalElements = response.totalElements

    if (
        isRecord(pageable) &&
        typeof totalPages === 'number' &&
        typeof totalElements === 'number'
    ) {
        const pageNumber =
            typeof pageable.pageNumber === 'number' ? pageable.pageNumber + 1 : defaultPage
        const pageSize =
            typeof pageable.pageSize === 'number' ? pageable.pageSize : defaultSize

        return {
            page: pageNumber,
            pageSize: pageSize,
            total: totalElements,
            totalPages: totalPages,
        }
    }

    return { page: defaultPage, pageSize: defaultSize, total: 0, totalPages: 0 }
}

/**
 * Fetch users list with filters
 */
export async function fetchUsersList(
    params: UsersListParams
): Promise<UsersListResponse> {
    const page = params.page ?? 1
    const size = params.size ?? 10

    // Convert to Spring Boot pagination (0-indexed)
    const apiParams: Record<string, unknown> = {
        page: page - 1,
        size: size,
    }

    if (params.keyword) {
        apiParams.keyword = params.keyword
    }

    if (params.role && params.role.length > 0) {
        // Backend expects single role, send first one
        apiParams.role = params.role[0]
    }

    console.log('🔵 [fetchUsersList] API Params:', apiParams)

    const { data } = await get<unknown>('/users', { params: apiParams })

    console.log('🔵 [fetchUsersList] Raw response:', data)

    // Handle wrapped response with data property
    if (isRecord(data)) {
        const innerData = data.data

        // Check for Spring Boot Pageable structure in data.data
        if (isRecord(innerData)) {
            const content = innerData.content
            if (Array.isArray(content)) {
                const users = content.filter(isUser)
                const pagination = extractPagination(innerData, page, size)

                console.log('🔵 [fetchUsersList] Parsed users:', users.length)
                console.log('🔵 [fetchUsersList] Pagination:', pagination)

                return { users, pagination }
            }
        }
    }

    // Fallback
    return {
        users: [],
        pagination: { page, pageSize: size, total: 0, totalPages: 0 },
    }
}

/**
 * Create new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
    const response = await post<{ data: User }>('/users', data)
    return response.data.data
}

/**
 * Delete user by ID
 */
export async function deleteUser(id: number): Promise<void> {
    await del(`/users/${id}`)
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User> {
    const response = await get<{ data: User }>(`/users/${id}`)
    return response.data.data
}
