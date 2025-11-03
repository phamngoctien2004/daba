/**
 * Rooms Management API
 */

import { get, post, put, del } from '@/lib/api-client'

export interface Room {
    roomId: number
    roomName: string
    roomNumber: string
    departmentName: string
    departmentId?: number
}

export interface RoomDetail {
    roomId: number
    roomName: string
    roomNumber: string
    departmentId: number | null
    departmentName: string
}

export interface CreateRoomRequest {
    roomName: string
    roomNumber: string
    departmentId: number | null
}

export interface UpdateRoomRequest {
    roomId: number
    roomName: string
    roomNumber: string
    departmentId: number | null
}

export interface RoomsListParams {
    keyword?: string
    departmentIds?: number[]
    page?: number
    size?: number
}

export interface RoomsListResponse {
    rooms: Room[]
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
 * Type guard for Room
 */
function isRoom(value: unknown): value is Room {
    if (!isRecord(value)) return false
    return (
        typeof value.roomId === 'number' &&
        typeof value.roomName === 'string' &&
        typeof value.roomNumber === 'string' &&
        typeof value.departmentName === 'string'
    )
}

/**
 * Extract pagination info from Spring Boot response
 */
function extractPagination(
    response: unknown,
    defaultPage: number,
    defaultSize: number
): RoomsListResponse['pagination'] {
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
 * Fetch rooms list
 */
export async function fetchRoomsList(
    params: RoomsListParams
): Promise<RoomsListResponse> {
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

    if (params.departmentIds && params.departmentIds.length > 0) {
        apiParams.departmentIds = params.departmentIds.join(',')
    }

    console.log('🔵 [fetchRoomsList] API Params:', apiParams)

    const { data } = await get<unknown>('/rooms', { params: apiParams })

    console.log('🔵 [fetchRoomsList] Raw response:', data)

    // Handle wrapped response with data property
    if (isRecord(data)) {
        const innerData = data.data

        // Check for Spring Boot Pageable structure in data.data
        if (isRecord(innerData)) {
            const content = innerData.content
            if (Array.isArray(content)) {
                const rooms = content.filter(isRoom)
                const pagination = extractPagination(innerData, page, size)
                return { rooms, pagination }
            }
        }

        // Check for direct content in data
        const content = data.content
        if (Array.isArray(content)) {
            const rooms = content.filter(isRoom)
            const pagination = extractPagination(data, page, size)
            return { rooms, pagination }
        }
    }

    // Handle direct array response
    if (Array.isArray(data)) {
        const rooms = data.filter(isRoom)
        return {
            rooms,
            pagination: {
                page,
                pageSize: size,
                total: rooms.length,
                totalPages: rooms.length > 0 ? 1 : 0,
            },
        }
    }

    console.warn('⚠️ [fetchRoomsList] Unexpected response format:', data)
    return {
        rooms: [],
        pagination: { page, pageSize: size, total: 0, totalPages: 0 },
    }
}

/**
 * Fetch room detail by ID
 */
export async function fetchRoomDetail(roomId: number): Promise<RoomDetail | null> {
    try {
        const { data } = await get<unknown>(`/rooms/${roomId}`)

        console.log('🔵 [fetchRoomDetail] Raw response:', data)

        // Handle wrapped response: {data: {...}, message: "..."}
        if (isRecord(data) && 'data' in data) {
            const innerData = data.data
            if (isRecord(innerData)) {
                return {
                    roomId: typeof innerData.roomId === 'number' ? innerData.roomId : roomId,
                    roomName: typeof innerData.roomName === 'string' ? innerData.roomName : '',
                    roomNumber: typeof innerData.roomNumber === 'string' ? innerData.roomNumber : '',
                    departmentId: typeof innerData.departmentId === 'number' ? innerData.departmentId : null,
                    departmentName: typeof innerData.departmentName === 'string' ? innerData.departmentName : '',
                }
            }
        }

        // Handle direct response
        if (isRecord(data)) {
            return {
                roomId: typeof data.roomId === 'number' ? data.roomId : roomId,
                roomName: typeof data.roomName === 'string' ? data.roomName : '',
                roomNumber: typeof data.roomNumber === 'string' ? data.roomNumber : '',
                departmentId: typeof data.departmentId === 'number' ? data.departmentId : null,
                departmentName: typeof data.departmentName === 'string' ? data.departmentName : '',
            }
        }

        console.warn('⚠️ [fetchRoomDetail] Unexpected response format:', data)
        return null
    } catch (error) {
        console.error('🔴 [fetchRoomDetail] Error:', error)
        return null
    }
}

/**
 * Create new room
 */
export async function createRoom(payload: CreateRoomRequest): Promise<RoomDetail> {
    const { data } = await post<unknown>('/rooms', payload)

    console.log('🔵 [createRoom] Response:', data)

    // Handle wrapped response
    if (isRecord(data) && 'data' in data) {
        const innerData = data.data
        if (isRecord(innerData)) {
            return {
                roomId: typeof innerData.roomId === 'number' ? innerData.roomId : 0,
                roomName: typeof innerData.roomName === 'string' ? innerData.roomName : '',
                roomNumber: typeof innerData.roomNumber === 'string' ? innerData.roomNumber : '',
                departmentId: typeof innerData.departmentId === 'number' ? innerData.departmentId : null,
                departmentName: typeof innerData.departmentName === 'string' ? innerData.departmentName : '',
            }
        }
    }

    // Handle direct response
    if (isRecord(data)) {
        return {
            roomId: typeof data.roomId === 'number' ? data.roomId : 0,
            roomName: typeof data.roomName === 'string' ? data.roomName : '',
            roomNumber: typeof data.roomNumber === 'string' ? data.roomNumber : '',
            departmentId: typeof data.departmentId === 'number' ? data.departmentId : null,
            departmentName: typeof data.departmentName === 'string' ? data.departmentName : '',
        }
    }

    throw new Error('Invalid response format from create room API')
}

/**
 * Update room
 */
export async function updateRoom(payload: UpdateRoomRequest): Promise<RoomDetail> {
    const { data } = await put<unknown>('/rooms', payload)

    console.log('🔵 [updateRoom] Response:', data)

    // Handle wrapped response
    if (isRecord(data) && 'data' in data) {
        const innerData = data.data
        if (isRecord(innerData)) {
            return {
                roomId: typeof innerData.roomId === 'number' ? innerData.roomId : payload.roomId,
                roomName: typeof innerData.roomName === 'string' ? innerData.roomName : '',
                roomNumber: typeof innerData.roomNumber === 'string' ? innerData.roomNumber : '',
                departmentId: typeof innerData.departmentId === 'number' ? innerData.departmentId : null,
                departmentName: typeof innerData.departmentName === 'string' ? innerData.departmentName : '',
            }
        }
    }

    // Handle direct response
    if (isRecord(data)) {
        return {
            roomId: typeof data.roomId === 'number' ? data.roomId : payload.roomId,
            roomName: typeof data.roomName === 'string' ? data.roomName : '',
            roomNumber: typeof data.roomNumber === 'string' ? data.roomNumber : '',
            departmentId: typeof data.departmentId === 'number' ? data.departmentId : null,
            departmentName: typeof data.departmentName === 'string' ? data.departmentName : '',
        }
    }

    throw new Error('Invalid response format from update room API')
}

/**
 * Delete room
 */
export async function deleteRoom(roomId: number): Promise<void> {
    await del(`/rooms/${roomId}`)
    console.log('🔵 [deleteRoom] Room deleted:', roomId)
}
