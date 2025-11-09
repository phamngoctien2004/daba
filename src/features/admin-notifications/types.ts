/**
 * Admin Notifications Management Types
 */

export interface Notification {
    id: number
    title: string
    content: string
    image: string | null
    time: string // ISO 8601 format
}

export interface NotificationListResponse {
    content: Notification[]
    pageable: {
        pageNumber: number
        pageSize: number
        sort: {
            sorted: boolean
            unsorted: boolean
            empty: boolean
        }
        offset: number
        paged: boolean
        unpaged: boolean
    }
    totalPages: number
    totalElements: number
    last: boolean
    first: boolean
    size: number
    number: number
    sort: {
        sorted: boolean
        unsorted: boolean
        empty: boolean
    }
    numberOfElements: number
    empty: boolean
}

export interface CreateNotificationRequest {
    title: string
    content: string
    image?: string
}

export interface UpdateNotificationRequest {
    id: number
    title: string
    content: string
    image?: string
}

export interface ApiResponse<T> {
    data: T
    message: string
}

export interface NotificationListParams {
    page?: number
    size?: number
}
