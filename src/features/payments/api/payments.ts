import { get, post } from '@/lib/api-client'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Invoice API
 */

export interface PayCashPayload {
  medicalRecordId: number
  amount: number
  paymentMethod: 'CASH'
}

interface PayCashApiResponse {
  data?: unknown
  message?: string
}

/**
 * Pay cash for medical record
 * POST /api/invoices/pay-cash
 */
export const payCash = async (
  payload: PayCashPayload
): Promise<{ message: string }> => {
  const { data } = await post<PayCashApiResponse>('/invoices/pay-cash', payload)

  const response = data ?? {}

  return {
    message:
      isRecord(response) && typeof response.message === 'string'
        ? response.message
        : 'Thanh toán thành công',
  }
}

/**
 * Payment API (QR/Online)
 */

export interface CreatePaymentLinkPayload {
  medicalRecordId: number
  amount: number
  description?: string
  returnUrl?: string
  cancelUrl?: string
}

export interface PaymentLinkResponse {
  checkoutUrl: string
  orderCode: number
  qrCode: string
}

interface CreatePaymentLinkApiResponse {
  data?: unknown
  message?: string
}

/**
 * Create payment link (PayOS)
 * POST /api/payments/create-link
 */
export const createPaymentLink = async (
  payload: CreatePaymentLinkPayload
): Promise<PaymentLinkResponse> => {
  const { data } = await post<CreatePaymentLinkApiResponse>('/payments/create-link', payload)

  const response = data ?? {}
  const paymentData = isRecord(response) ? response.data : undefined

  if (!isRecord(paymentData)) {
    throw new Error('Không thể tạo link thanh toán')
  }

  return {
    checkoutUrl: typeof paymentData.checkoutUrl === 'string' ? paymentData.checkoutUrl : '',
    orderCode: typeof paymentData.orderCode === 'number' ? paymentData.orderCode : 0,
    qrCode: typeof paymentData.qrCode === 'string' ? paymentData.qrCode : '',
  }
}

/**
 * Payment status response
 */
export interface PaymentStatus {
  orderCode: number
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED'
  amount: number
  transactionId?: string
}

interface PaymentStatusApiResponse {
  data?: unknown
  message?: string
}

/**
 * Check payment status
 * GET /api/payments/status/{orderCode}
 */
export const checkPaymentStatus = async (
  orderCode: number
): Promise<PaymentStatus> => {
  const { data } = await get<PaymentStatusApiResponse>(`/payments/status/${orderCode}`)

  const response = data ?? {}
  const statusData = isRecord(response) ? response.data : undefined

  if (!isRecord(statusData)) {
    throw new Error('Không thể kiểm tra trạng thái thanh toán')
  }

  return {
    orderCode: typeof statusData.orderCode === 'number' ? statusData.orderCode : 0,
    status:
      typeof statusData.status === 'string'
        ? (statusData.status as PaymentStatus['status'])
        : 'PENDING',
    amount: typeof statusData.amount === 'number' ? statusData.amount : 0,
    transactionId:
      typeof statusData.transactionId === 'string' ? statusData.transactionId : undefined,
  }
}
