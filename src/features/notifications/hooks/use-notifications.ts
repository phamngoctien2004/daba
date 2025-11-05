import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import {
    fetchNotifications,
    markNotificationsAsRead,
} from '../api/notifications'

/**
 * Hook to fetch notifications for admin
 * Refetch every 10 seconds for real-time feel
 */
export function useNotifications() {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
        refetchInterval: 10000, // Refetch every 10 seconds (more aggressive)
        staleTime: 5000, // Consider data stale after 5 seconds
        refetchOnWindowFocus: true, // Refetch when window gains focus
        refetchOnMount: true, // Always refetch on mount
    })
}/**
 * Hook to mark notifications as read
 * Invalidates notification queries after success
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: markNotificationsAsRead,
        onSuccess: () => {
            // Invalidate and refetch notifications
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
        onError: (error) => {
            console.error('Failed to mark notifications as read:', error)
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể đánh dấu thông báo đã đọc',
            })
        },
    })
}
