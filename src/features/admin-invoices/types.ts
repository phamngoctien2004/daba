/**
 * Admin Invoice Management Types
 * Based on API spec at docs/api.md line 2622
 */

// ==================== Payment Status & Method ====================

export type PaymentStatus =
    | 'CHUA_THANH_TOAN'        // Chưa thanh toán
    | 'DA_THANH_TOAN'          // Đã thanh toán
    | 'THANH_TOAN_MOT_PHAN'    // Thanh toán một phần

export type PaymentMethod =
    | 'TIEN_MAT'          // Tiền mặt
    | 'CHUYEN_KHOAN'      // Chuyển khoản

// ==================== Invoice Interface ====================

export interface Invoice {
    id: number
    code: string
    patientName: string
    paymentMethod: PaymentMethod
    paymentDate: string // ISO datetime string
    totalAmount: number
    paidAmount: number
    status: PaymentStatus
    examFee: number | null
    date: string | null
}

// ==================== Filter Types ====================

export interface InvoiceFilters {
    keyword?: string
    fromDate?: string // yyyy-MM-dd
    toDate?: string // yyyy-MM-dd
    paymentStatus?: PaymentStatus | null
    method?: PaymentMethod | null
}

export interface InvoiceListParams {
    page?: number
    size?: number
    sort?: string // e.g., "paymentDate,asc"
    filters?: InvoiceFilters
}

// ==================== Response Types ====================

export interface InvoicesResponse {
    data: {
        content: Invoice[]
        pageable: {
            pageNumber: number
            pageSize: number
            sort: {
                sorted: boolean
                unsorted: boolean
                empty: boolean
            }
            offset: number
            paged: boolean
            unpaged: boolean
        }
        totalPages: number
        totalElements: number
        last: boolean
        size: number
        number: number
        sort: {
            sorted: boolean
            unsorted: boolean
            empty: boolean
        }
        numberOfElements: number
        first: boolean
        empty: boolean
    }
    message?: string
}

export interface InvoiceListResponse {
    data: Invoice[]
    pagination: {
        page: number
        size: number
        total: number
        totalPages: number
    }
}
