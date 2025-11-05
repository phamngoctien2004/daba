import { get, post } from '@/lib/api-client'
import type { NotificationsResponse } from '../types'

/**
 * Fetch all notifications for the current admin user
 * GET /api/users/notifications
 */
export async function fetchNotifications(): Promise<NotificationsResponse> {
    const { data } = await get<NotificationsResponse>('/users/notifications')
    return data
}

/**
 * Mark all notifications as read for admin
 * POST /api/users/notifications/mark-as-read
 */
export async function markNotificationsAsRead(): Promise<void> {
    await post('/users/notifications/mark-as-read', {})
}
