/**
 * Admin Invoices API
 * Based on API spec at docs/api.md line 2622
 * 
 * Endpoint: GET /api/invoices
 * - Query params: page, size, sort, keyword, paymentStatus, method, fromDate, toDate
 */

import { get } from '@/lib/api-client'
import type {
    InvoiceListParams,
    InvoicesResponse,
} from '../types'

/**
 * Fetch list of invoices with filters
 * All filters are sent as query parameters
 */
export async function fetchInvoices(params: InvoiceListParams): Promise<{
    content: any[]
    totalPages: number
    totalElements: number
    number: number
    size: number
}> {
    const { page = 0, size = 10, sort = 'paymentDate,desc', filters = {} } = params

    // Build query params
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('size', size.toString())
    queryParams.append('sort', sort)

    // Add filters to query params (only if provided)
    if (filters.keyword) {
        queryParams.append('keyword', filters.keyword)
    }
    if (filters.fromDate) {
        queryParams.append('fromDate', filters.fromDate)
    }
    if (filters.toDate) {
        queryParams.append('toDate', filters.toDate)
    }
    if (filters.paymentStatus) {
        queryParams.append('paymentStatus', filters.paymentStatus)
    }
    if (filters.method) {
        queryParams.append('method', filters.method)
    }

    console.log('🔵 [fetchInvoices] Request:', {
        url: `/invoices?${queryParams.toString()}`,
        method: 'GET',
    })

    // API endpoint: GET /api/invoices
    const { data } = await get<InvoicesResponse>(
        `/invoices?${queryParams.toString()}`
    )

    // Extract from nested structure
    const responseData = data?.data || {}

    return {
        content: responseData.content || [],
        totalPages: responseData.totalPages || 0,
        totalElements: responseData.totalElements || 0,
        number: responseData.number || 0,
        size: responseData.size || size,
    }
}
