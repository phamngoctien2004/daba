/**
 * Admin Invoices Hooks
 */

import { useQuery } from '@tanstack/react-query'
import { fetchInvoices } from '../api/invoices'
import type { InvoiceListParams } from '../types'

// ==================== Query Keys ====================

export const invoiceKeys = {
    all: ['admin-invoices'] as const,
    lists: () => [...invoiceKeys.all, 'list'] as const,
    list: (params: InvoiceListParams) => [...invoiceKeys.lists(), params] as const,
}

// ==================== Invoice Hooks ====================

/**
 * Hook to fetch list of invoices with filters and pagination
 */
export function useInvoices(params: InvoiceListParams) {
    return useQuery({
        queryKey: invoiceKeys.list(params),
        queryFn: () => fetchInvoices(params),
        staleTime: 30_000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
    })
}
