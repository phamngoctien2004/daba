/**
 * QR Code Generator Utilities
 * Using API from api.qrserver.com (free service)
 */

export interface QRCodeOptions {
    size?: string // Default: '300x300'
    format?: 'png' | 'gif' | 'jpeg' | 'jpg' | 'svg'
    errorCorrection?: 'L' | 'M' | 'Q' | 'H' // L=~7%, M=~15%, Q=~25%, H=~30%
    margin?: number // Margin in pixels (default: 0)
    color?: string // Foreground color in hex (e.g., '000000')
    bgcolor?: string // Background color in hex (e.g., 'FFFFFF')
}

/**
 * Generate QR code image URL from data string
 * Uses api.qrserver.com free service
 * 
 * @param data - The data to encode in QR code (payment link, text, URL, etc.)
 * @param options - QR code customization options
 * @returns URL to QR code image
 * 
 * @example
 * ```typescript
 * const qrImageUrl = generateQRCodeImageUrl('https://payment-link.com/pay/123456', {
 *   size: '400x400',
 *   errorCorrection: 'M'
 * })
 * // Returns: 'https://api.qrserver.com/v1/create-qr-code/?data=https%3A%2F%2F...'
 * ```
 */
export function generateQRCodeImageUrl(
    data: string,
    options: QRCodeOptions = {}
): string {
    const {
        size = '300x300',
        format = 'png',
        errorCorrection = 'M',
        margin = 10,
        color,
        bgcolor,
    } = options

    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/'

    const params = new URLSearchParams({
        data: data,
        size: size,
        format: format,
        ecc: errorCorrection,
        margin: margin.toString(),
    })

    // Add optional color parameters
    if (color) {
        params.append('color', color)
    }

    if (bgcolor) {
        params.append('bgcolor', bgcolor)
    }

    return `${baseUrl}?${params.toString()}`
}

/**
 * Generate QR code image URL for payment
 * Optimized for payment QR codes with high error correction
 * 
 * @param paymentData - Payment link or payment data string
 * @param size - QR code size (default: '400x400')
 * @returns URL to QR code image
 */
export function generatePaymentQRCode(
    paymentData: string,
    size: string = '400x400'
): string {
    return generateQRCodeImageUrl(paymentData, {
        size,
        errorCorrection: 'H', // High error correction for payment
        margin: 20, // Larger margin for better scanning
        format: 'png',
    })
}

/**
 * Download QR code image as file
 * 
 * @param qrImageUrl - URL of the QR code image
 * @param filename - Filename for download (default: 'qr-code.png')
 */
export async function downloadQRCode(
    qrImageUrl: string,
    filename: string = 'qr-code.png'
): Promise<void> {
    try {
        const response = await fetch(qrImageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        window.URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Failed to download QR code:', error)
        throw new Error('Không thể tải mã QR')
    }
}

/**
 * Validate if string is a valid URL for QR code
 */
export function isValidQRData(data: string): boolean {
    if (!data || data.trim() === '') return false

    // Check length (most QR code readers support up to ~4000 characters)
    if (data.length > 4000) return false

    return true
}
