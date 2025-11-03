import { get } from '@/lib/api-client'

export interface Room {
    roomId: number
    roomName: string
    roomNumber: string
    departmentId: number | null
    departmentName: string
}

interface RoomsResponse {
    data: Room[]
    message: string
}

/**
 * Fetch all rooms without pagination
 */
export async function fetchRooms(keyword?: string): Promise<Room[]> {
    try {
        const params = new URLSearchParams()
        if (keyword) {
            params.append('keyword', keyword)
        }

        const { data } = await get<RoomsResponse>(`/rooms/not-paginated?${params.toString()}`)

        // Handle response format: {data: [...], message: "..."}
        if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
            return data.data
        }

        // Fallback: if data is already an array
        if (Array.isArray(data)) {
            return data
        }

        console.warn('🟡 [fetchRooms] Unexpected response format:', data)
        return []
    } catch (error) {
        console.error('🔴 [fetchRooms] Error:', error)
        return []
    }
}
