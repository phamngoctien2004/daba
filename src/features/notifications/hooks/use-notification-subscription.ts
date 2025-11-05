import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { wsClient } from '@/lib/websocket-client'
import { useAuthStore } from '@/stores/auth-store'
import type { Notification } from '../types'

/**
 * Hook to subscribe to real-time notifications via WebSocket
 * Automatically connects and subscribes when user is authenticated
 */
export function useNotificationSubscription() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()

    useEffect(() => {
        if (!user?.id) {
            console.log('🔵 [Notifications] No user ID, skipping subscription')
            return
        }

        let unsubscribe: (() => void) | null = null

        const setupSubscription = async () => {
            try {
                // Connect to WebSocket if not connected
                if (!wsClient.isConnected()) {
                    console.log('🔵 [Notifications] Connecting to WebSocket...')
                    await wsClient.connect()
                }

                // Subscribe to notifications
                console.log(`🔵 [Notifications] Subscribing to /topic/notifications/book.${user.id}`)
                unsubscribe = wsClient.subscribeToNotifications(user.id, (notification: Notification) => {
                    console.log('✅ [Notifications] Received new notification:', notification)
                    console.log('✅ [Notifications] Current data before invalidate:', queryClient.getQueryData(['notifications']))

                    // IMPORTANT: Invalidate and refetch immediately
                    queryClient.invalidateQueries({
                        queryKey: ['notifications'],
                        refetchType: 'active' // Force refetch active queries
                    })

                    // Also refetch to ensure fresh data
                    queryClient.refetchQueries({
                        queryKey: ['notifications'],
                        type: 'active'
                    })

                    console.log('✅ [Notifications] Query invalidated and refetching...')

                    // Optional: Show browser notification (if permission granted)
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Thông báo mới', {
                            body: notification.title,
                            icon: '/favicon.ico',
                        })
                    }
                })

                console.log('✅ [Notifications] Subscription setup completed')
            } catch (error) {
                console.error('❌ [Notifications] Failed to setup subscription:', error)
            }
        }

        setupSubscription()

        // Cleanup: unsubscribe when component unmounts
        return () => {
            if (unsubscribe) {
                console.log('🔵 [Notifications] Cleaning up subscription')
                unsubscribe()
            }
        }
    }, [user?.id, queryClient])
}

/**
 * Request browser notification permission
 * Call this once when app starts or user enables notifications
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('⚠️ [Notifications] Browser does not support notifications')
        return false
    }

    if (Notification.permission === 'granted') {
        return true
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
    }

    return false
}
