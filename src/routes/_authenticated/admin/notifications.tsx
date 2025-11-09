import { createFileRoute } from '@tanstack/react-router'
import AdminNotificationsPage from '@/features/admin-notifications'

export const Route = createFileRoute('/_authenticated/admin/notifications')({
    component: AdminNotificationsPage,
})
