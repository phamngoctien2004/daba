export type NotificationType = 'DAT_LICH' | 'HUY_LICH' | 'XAC_NHAN_LICH' | 'KHAC'

export interface Notification {
    id: number
    title: string
    time: string // ISO 8601 format: "2025-11-04T20:28:15"
    isUserRead: boolean
    isAdminRead: boolean
    receiverId: number
    typeId: number
    type: NotificationType
}

export interface NotificationsResponse {
    data: {
        notifications: Notification[]
        unreadCount: number
    }
    message: string
}
