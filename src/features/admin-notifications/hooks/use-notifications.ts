/**
 * Admin Notifications React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import {
    fetchNotifications,
    fetchNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    uploadFile,
    sendNotificationToUsers,
} from '../api/notifications'
import type {
    NotificationListParams,
    CreateNotificationRequest,
    UpdateNotificationRequest,
} from '../types'

/**
 * Hook to fetch notifications list
 */
export function useNotifications(params: NotificationListParams = {}) {
    return useQuery({
        queryKey: ['admin-notifications', params],
        queryFn: () => fetchNotifications(params),
    })
}

/**
 * Hook to fetch single notification
 */
export function useNotification(id: number | null) {
    return useQuery({
        queryKey: ['admin-notifications', id],
        queryFn: () => fetchNotificationById(id!),
        enabled: id !== null,
    })
}

/**
 * Hook to create notification
 */
export function useCreateNotification() {
    const { toast } = useToast()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateNotificationRequest) => createNotification(payload),
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: 'Tạo thông báo thành công',
            })
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
        },
        onError: () => {
            toast({
                title: 'Lỗi',
                description: 'Không thể tạo thông báo',
                variant: 'destructive',
            })
        },
    })
}

/**
 * Hook to update notification
 */
export function useUpdateNotification() {
    const { toast } = useToast()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: UpdateNotificationRequest) => updateNotification(payload),
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: 'Cập nhật thông báo thành công',
            })
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
        },
        onError: () => {
            toast({
                title: 'Lỗi',
                description: 'Không thể cập nhật thông báo',
                variant: 'destructive',
            })
        },
    })
}

/**
 * Hook to delete notification
 */
export function useDeleteNotification() {
    const { toast } = useToast()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteNotification(id),
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: 'Xóa thông báo thành công',
            })
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
        },
        onError: () => {
            toast({
                title: 'Lỗi',
                description: 'Không thể xóa thông báo',
                variant: 'destructive',
            })
        },
    })
}

/**
 * Hook to upload file
 */
export function useUploadFile() {
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ file, type }: { file: File; type?: string }) => uploadFile(file, type),
        onError: () => {
            toast({
                title: 'Lỗi',
                description: 'Không thể tải lên hình ảnh',
                variant: 'destructive',
            })
        },
    })
}

/**
 * Hook to send notification to users
 */
export function useSendNotification() {
    const { toast } = useToast()

    return useMutation({
        mutationFn: (notificationId: number) => sendNotificationToUsers(notificationId),
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: 'Gửi thông báo đến người dùng thành công',
            })
        },
        onError: () => {
            toast({
                title: 'Lỗi',
                description: 'Không thể gửi thông báo',
                variant: 'destructive',
            })
        },
    })
}
