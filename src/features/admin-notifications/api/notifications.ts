/**
 * Admin Notifications API Client
 */

import { get, post, put, del } from '@/lib/api-client'
import type {
    Notification,
    NotificationListResponse,
    CreateNotificationRequest,
    UpdateNotificationRequest,
    ApiResponse,
    NotificationListParams,
} from '../types'

/**
 * Fetch paginated notifications list
 */
export async function fetchNotifications(params: NotificationListParams = {}): Promise<NotificationListResponse> {
    const { data } = await get<ApiResponse<NotificationListResponse>>('/notifications', { params })
    return data.data
}

/**
 * Fetch single notification by ID
 */
export async function fetchNotificationById(id: number): Promise<Notification> {
    const { data } = await get<ApiResponse<Notification>>(`/notifications/${id}`)
    return data.data
}

/**
 * Create new notification
 */
export async function createNotification(payload: CreateNotificationRequest): Promise<Notification> {
    const { data } = await post<ApiResponse<Notification>>('/notifications', payload)
    return data.data
}

/**
 * Update existing notification
 */
export async function updateNotification(payload: UpdateNotificationRequest): Promise<Notification> {
    const { data } = await put<ApiResponse<Notification>>('/notifications', payload)
    return data.data
}

/**
 * Delete notification
 */
export async function deleteNotification(id: number): Promise<void> {
    await del(`/notifications/${id}`)
}

/**
 * Upload image file
 */
export async function uploadFile(file: File, type: string = 'notification'): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const { data } = await post<ApiResponse<string>>('/files', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return data.data
}

/**
 * Send notification to users
 */
export async function sendNotificationToUsers(notificationId: number): Promise<void> {
    await post(`/users/send-newsletter/${notificationId}`, {})
}
