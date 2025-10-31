/**
 * Admin Overview Dashboard Route
 */

import { createFileRoute } from '@tanstack/react-router'
import AdminOverviewPage from '@/features/admin-overview'

export const Route = createFileRoute('/_authenticated/admin/overview')({
    component: AdminOverviewPage,
})
