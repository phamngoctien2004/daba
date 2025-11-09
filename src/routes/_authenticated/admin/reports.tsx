/**
 * Admin Reports & Analytics Route
 */

import { createFileRoute } from '@tanstack/react-router'
import AdminReportsPage from '@/features/admin-reports'

export const Route = createFileRoute('/_authenticated/admin/reports')({
    component: AdminReportsPage,
})
