import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, User, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { QRPaymentModal } from '@/components/qr-payment-modal'
import { useMedicalRecordDetail, usePayCash } from '../hooks/use-medical-record-detail'
import { exportInvoiceHtml } from '../api/medical-records'
import type { MedicalRecordStatus, InvoiceDetail } from '../types'
import { createPaymentLink } from '@/features/payments/api/payments'
import { wsClient } from '@/lib/websocket-client'
import { generatePaymentQRCode } from '@/lib/qr-code-generator'

interface MedicalRecordDetailPageProps {
    id: string
}

const statusMap: Record<MedicalRecordStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    CHO_KHAM: { label: 'Chờ khám', variant: 'secondary' },
    DANG_KHAM: { label: 'Đang khám', variant: 'default' },
    CHO_XET_NGHIEM: { label: 'Chờ xét nghiệm', variant: 'secondary' },
    HOAN_THANH: { label: 'Hoàn thành', variant: 'outline' },
    HUY: { label: 'Hủy', variant: 'destructive' },
}

const paymentStatusMap = {
    DA_THANH_TOAN: { label: 'Đã thanh toán', variant: 'outline' as const },
    THANH_TOAN_MOT_PHAN: { label: 'Thanh toán một phần', variant: 'secondary' as const },
    CHUA_THANH_TOAN: { label: 'Chưa thanh toán', variant: 'default' as const },
}

const labStatusMap = {
    CHO_THUC_HIEN: { label: 'Chờ thực hiện', variant: 'secondary' as const },
    DANG_THUC_HIEN: { label: 'Đang thực hiện', variant: 'default' as const },
    HOAN_THANH: { label: 'Hoàn thành', variant: 'outline' as const },
    HUY: { label: 'Hủy', variant: 'destructive' as const },
}

function InvoiceDetailCard({ detail }: { detail: InvoiceDetail }) {
    const [expanded, setExpanded] = useState(false)
    const hasMultipleLab = detail.multipleLab && detail.multipleLab.length > 0
    const hasSingleLab = detail.singleLab

    // Debug: log the detail structure
    console.log('🔵 InvoiceDetail:', detail)
    console.log('🔵 Detail status:', detail.status)

    // Safe access to payment status with fallback
    const paymentStatus = detail.status && paymentStatusMap[detail.status]
        ? paymentStatusMap[detail.status]
        : { label: 'Chưa xác định', variant: 'secondary' as const }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-base font-semibold">{detail.healthPlanName}</CardTitle>
                        <CardDescription className="mt-1 text-sm">{detail.description}</CardDescription>
                    </div>
                    <Badge variant={paymentStatus.variant}>
                        {paymentStatus.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Giá:</span>
                        <span className="font-medium">{detail.healthPlanPrice.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Đã thanh toán:</span>
                        <span className="font-medium">{detail.paid.toLocaleString('vi-VN')} đ</span>
                    </div>
                    {detail.paid < detail.healthPlanPrice && (
                        <div className="flex justify-between text-destructive">
                            <span>Còn lại:</span>
                            <span className="font-medium">
                                {(detail.healthPlanPrice - detail.paid).toLocaleString('vi-VN')} đ
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Loại dịch vụ:</span>
                        <span>{detail.typeService === 'MULTIPLE' ? 'Gói nhiều dịch vụ' : 'Dịch vụ đơn'}</span>
                    </div>

                    {/* Lab Orders Section */}
                    {(hasMultipleLab || hasSingleLab) && (
                        <>
                            <Separator className="my-2" />
                            <div>
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="flex w-full items-center justify-between text-sm font-medium hover:underline"
                                >
                                    <span>Xem chi tiết ({hasMultipleLab ? detail.multipleLab!.length : 1} mục)</span>
                                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>

                                {expanded && (
                                    <div className="mt-3 space-y-3">
                                        {hasMultipleLab &&
                                            detail.multipleLab!.map((lab) => {
                                                const labStatus = lab.status && labStatusMap[lab.status]
                                                    ? labStatusMap[lab.status]
                                                    : { label: 'Chưa xác định', variant: 'secondary' as const }

                                                return (
                                                    <div key={lab.id} className="rounded-lg border bg-muted/50 p-3">
                                                        <div className="mb-2 flex items-start justify-between">
                                                            <p className="font-medium">{lab.name}</p>
                                                            <Badge variant={labStatus.variant} className="ml-2 text-xs">
                                                                {labStatus.label}
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-1 text-xs text-muted-foreground">
                                                            <p>Mã: {lab.code}</p>
                                                            <p>Phòng: {lab.room}</p>
                                                            {lab.doctorPerforming && <p>Bác sĩ: {lab.doctorPerforming}</p>}
                                                            <p>
                                                                Tạo lúc: {format(new Date(lab.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            })}

                                        {hasSingleLab && (() => {
                                            const singleLabStatus = detail.singleLab!.status && labStatusMap[detail.singleLab!.status]
                                                ? labStatusMap[detail.singleLab!.status]
                                                : { label: 'Chưa xác định', variant: 'secondary' as const }

                                            return (
                                                <div className="rounded-lg border bg-muted/50 p-3">
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <p className="font-medium">{detail.singleLab!.name}</p>
                                                        <Badge
                                                            variant={singleLabStatus.variant}
                                                            className="ml-2 text-xs"
                                                        >
                                                            {singleLabStatus.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-1 text-xs text-muted-foreground">
                                                        <p>Mã: {detail.singleLab!.code}</p>
                                                        <p>Phòng: {detail.singleLab!.room}</p>
                                                        {detail.singleLab!.doctorPerforming && (
                                                            <p>Bác sĩ: {detail.singleLab!.doctorPerforming}</p>
                                                        )}
                                                        <p>
                                                            Tạo lúc:{' '}
                                                            {format(new Date(detail.singleLab!.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })()}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export function MedicalRecordDetailPage({ id }: MedicalRecordDetailPageProps) {
    const navigate = useNavigate()
    const { data: record, isLoading, error } = useMedicalRecordDetail(id)
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>('cash')
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const { mutate: payWithCash, isPending: isPayingCash } = usePayCash()

    // QR Payment state
    const [showQRModal, setShowQRModal] = useState(false)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [orderCode, setOrderCode] = useState<number | null>(null)
    const [isCreatingQR, setIsCreatingQR] = useState(false)
    const [qrPaymentSuccess, setQrPaymentSuccess] = useState(false)

    // WebSocket cleanup on unmount
    useEffect(() => {
        return () => {
            if (wsClient.isConnected()) {
                wsClient.disconnect()
            }
        }
    }, [])

    // Helper function to print invoice
    const handlePrintInvoice = async (medicalRecordId: string) => {
        try {
            const htmlContent = await exportInvoiceHtml(Number(medicalRecordId))

            // Create a new window to display the HTML content
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                printWindow.document.write(htmlContent)
                printWindow.document.close()

                // Wait for content to load then trigger print
                printWindow.onload = () => {
                    printWindow.focus()
                    printWindow.print()
                }
            } else {
                toast.error('Không thể mở cửa sổ in. Vui lòng kiểm tra trình chặn popup.')
            }
        } catch (error) {
            console.error('Print invoice error:', error)
            toast.error('Lỗi khi in hóa đơn', {
                description: error instanceof Error ? error.message : 'Vui lòng thử lại',
            })
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        )
    }

    if (error || !record) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-semibold text-destructive">Không tìm thấy phiếu khám</p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Phiếu khám không tồn tại hoặc đã bị xóa.
                </p>
                <Button onClick={() => navigate({ to: '/medical-records' })} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách
                </Button>
            </div>
        )
    }

    const recordDate = new Date(record.date)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate({ to: '/medical-records' })}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Phiếu khám bệnh</h1>
                            <p className="text-sm text-muted-foreground">Mã phiếu: {record.code}</p>
                        </div>
                    </div>
                </div>
                <Badge variant={statusMap[record.status].variant} className="text-sm">
                    {statusMap[record.status].label}
                </Badge>
            </div>

            {/* Patient Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Thông tin bệnh nhân
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Họ và tên</p>
                            <p className="font-semibold">{record.patientName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" />
                                Số điện thoại
                            </p>
                            <p>{record.patientPhone || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Giới tính</p>
                            <p>{record.patientGender === 'NAM' ? 'Nam' : record.patientGender === 'NU' ? 'Nữ' : 'Khác'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                Địa chỉ
                            </p>
                            <p>{record.patientAddress || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Ngày khám
                            </p>
                            <p>{format(recordDate, 'HH:mm dd/MM/yyyy', { locale: vi })}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Triệu chứng</p>
                            <p>{record.symptoms || 'Không có triệu chứng'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Invoice Details / Services */}
            {record.invoiceDetailsResponse && record.invoiceDetailsResponse.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Chi tiết dịch vụ</h2>
                    <div className="grid gap-4">
                        {record.invoiceDetailsResponse.map((detail: InvoiceDetail) => (
                            <InvoiceDetailCard key={detail.id} detail={detail} />
                        ))}
                    </div>
                </div>
            )}

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Tổng thanh toán</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between text-lg">
                            <span className="font-medium">Tổng cộng:</span>
                            <span className="font-bold">{record.total.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Đã thanh toán:</span>
                            <span className="font-semibold text-green-600">
                                {(record.paid ?? 0).toLocaleString('vi-VN')} đ
                            </span>
                        </div>
                        {(record.paid ?? 0) < record.total && (
                            <div className="flex justify-between border-t pt-3">
                                <span className="font-medium text-destructive">Còn lại:</span>
                                <span className="font-bold text-destructive">
                                    {(record.total - (record.paid ?? 0)).toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons - Only show if there's remaining balance AND payment not yet successful */}
            {(record.paid ?? 0) < record.total && !paymentSuccess && (
                <Card>
                    <CardHeader>
                        <CardTitle>Thanh toán</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Payment Method Selection */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">
                                Phương thức thanh toán <span className="text-destructive">*</span>
                            </Label>
                            <RadioGroup
                                value={paymentMethod}
                                onValueChange={(value) => setPaymentMethod(value as 'cash' | 'qr')}
                                className="flex flex-col space-y-2"
                            >
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="cash" id="cash" />
                                    <Label htmlFor="cash" className="font-normal cursor-pointer">
                                        Tiền mặt
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="qr" id="qr" />
                                    <Label htmlFor="qr" className="font-normal cursor-pointer">
                                        Chuyển khoản QR
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            {paymentMethod === 'cash' ? (
                                <Button
                                    variant="default"
                                    disabled={isPayingCash}
                                    onClick={() => {
                                        // Get unpaid invoice details
                                        const unpaidInvoices = (record.invoiceDetailsResponse || []).filter(
                                            (detail) => detail.status === 'CHUA_THANH_TOAN' || detail.status === 'THANH_TOAN_MOT_PHAN'
                                        )

                                        if (unpaidInvoices.length === 0) {
                                            toast.error('Không có hóa đơn cần thanh toán')
                                            return
                                        }

                                        // Calculate total unpaid amount
                                        const totalUnpaid = unpaidInvoices.reduce((sum, detail) => {
                                            const detailPaid = detail.paid ?? 0
                                            const detailTotal = detail.healthPlanPrice ?? 0
                                            return sum + (detailTotal - detailPaid)
                                        }, 0)

                                        // Prepare payment payload
                                        const payload = {
                                            medicalRecordId: Number(record.id),
                                            healthPlanIds: unpaidInvoices.map((detail) => detail.healthPlanId),
                                            totalAmount: totalUnpaid,
                                        }

                                        console.log('🔵 Payment payload:', payload)

                                        // Call payment API and auto-print invoice on success
                                        payWithCash(payload, {
                                            onSuccess: () => {
                                                // Mark payment as successful to hide buttons
                                                setPaymentSuccess(true)

                                                // Auto print invoice after successful payment
                                                setTimeout(() => {
                                                    handlePrintInvoice(record.id)
                                                }, 500) // Small delay to ensure data is updated
                                            },
                                        })
                                    }}
                                >
                                    {isPayingCash ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    disabled={isCreatingQR}
                                    onClick={async () => {
                                        // Get unpaid invoice details
                                        const unpaidInvoices = (record.invoiceDetailsResponse || []).filter(
                                            (detail) => detail.status === 'CHUA_THANH_TOAN' || detail.status === 'THANH_TOAN_MOT_PHAN'
                                        )

                                        if (unpaidInvoices.length === 0) {
                                            toast.error('Không có hóa đơn cần thanh toán')
                                            return
                                        }

                                        // Calculate total unpaid amount
                                        const totalUnpaid = unpaidInvoices.reduce((sum, detail) => {
                                            const detailPaid = detail.paid ?? 0
                                            const detailTotal = detail.healthPlanPrice ?? 0
                                            return sum + (detailTotal - detailPaid)
                                        }, 0)

                                        try {
                                            setIsCreatingQR(true)

                                            // Step 1: Connect to WebSocket
                                            console.log('🔵 [QR Payment] Connecting to WebSocket...')
                                            await wsClient.connect()

                                            // Step 2: Create payment link
                                            console.log('🔵 [QR Payment] Creating payment link...')
                                            const paymentData = await createPaymentLink({
                                                medicalRecordId: Number(record.id),
                                                totalAmount: totalUnpaid,
                                                healthPlanIds: unpaidInvoices.map((detail) => detail.healthPlanId),
                                                doctorId: 0, // Medical record detail không có doctorId, gửi 0
                                            })

                                            console.log('✅ [QR Payment] Payment data received:', paymentData)

                                            // Step 3: Generate QR code image URL from qrCode string
                                            const qrCodeImageUrl = generatePaymentQRCode(paymentData.qrCode, '400x400')
                                            console.log('🔵 [QR Payment] Generated QR image URL:', qrCodeImageUrl)

                                            // Step 4: Show QR Modal
                                            setQrCode(qrCodeImageUrl) // Use generated image URL
                                            setOrderCode(paymentData.orderCode)
                                            setShowQRModal(true)
                                            setIsCreatingQR(false)

                                            // Step 4: Subscribe to payment success event
                                            console.log(`🔵 [QR Payment] Subscribing to invoice.${paymentData.invoiceId}`)
                                            const unsubscribe = wsClient.subscribeToInvoicePayment(
                                                paymentData.invoiceId,
                                                async (event) => {
                                                    console.log('✅ [QR Payment] Payment success event received:', event)

                                                    // Mark payment as successful
                                                    setQrPaymentSuccess(true)
                                                    toast.success('Thanh toán thành công!')

                                                    // Step 5: Print invoice (API dòng 3107/3113)
                                                    try {
                                                        console.log('🖨️ [QR Payment] Printing invoice...')
                                                        await handlePrintInvoice(record.id)
                                                    } catch (error) {
                                                        console.error('❌ [QR Payment] Print error:', error)
                                                        toast.error('Không thể in hóa đơn')
                                                    }

                                                    // Cleanup
                                                    setTimeout(() => {
                                                        unsubscribe()
                                                        setShowQRModal(false)
                                                        setPaymentSuccess(true)
                                                    }, 2000)
                                                }
                                            )
                                        } catch (error) {
                                            console.error('❌ [QR Payment] Error:', error)
                                            setIsCreatingQR(false)
                                            toast.error(
                                                error instanceof Error ? error.message : 'Không thể tạo mã QR thanh toán'
                                            )
                                        }
                                    }}
                                >
                                    {isCreatingQR ? 'Đang tạo...' : 'Tạo mã QR'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* QR Payment Modal */}
            <QRPaymentModal
                open={showQRModal}
                qrCode={qrCode}
                orderCode={orderCode}
                amount={
                    (record.invoiceDetailsResponse || [])
                        .filter((detail) => detail.status === 'CHUA_THANH_TOAN' || detail.status === 'THANH_TOAN_MOT_PHAN')
                        .reduce((sum, detail) => {
                            const detailPaid = detail.paid ?? 0
                            const detailTotal = detail.healthPlanPrice ?? 0
                            return sum + (detailTotal - detailPaid)
                        }, 0)
                }
                isConnecting={isCreatingQR}
                paymentSuccess={qrPaymentSuccess}
                onClose={() => {
                    setShowQRModal(false)
                    setQrPaymentSuccess(false)
                }}
                onForceClose={() => {
                    setShowQRModal(false)
                    setQrPaymentSuccess(false)
                    wsClient.disconnect()
                    toast.warning('Đã hủy thanh toán QR')
                }}
            />
        </div>
    )
}
