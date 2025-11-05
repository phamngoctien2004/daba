import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Clock, User, FileText, Stethoscope } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search as GlobalSearch } from '@/components/search'
import { useToast } from '@/hooks/use-toast'
import {
    fetchLabOrderById,
    updateLabOrderStatus,
    processLabOrder,
} from '../api/lab-orders'
import { LabParamsTable } from './lab-params-table'
import { LabParamsForm } from './lab-params-form'
import type { LabOrderStatus } from '../types'

const statusConfig: Record<
    LabOrderStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
    CHO_THUC_HIEN: { label: 'Chờ thực hiện', variant: 'secondary' },
    DANG_THUC_HIEN: { label: 'Đang thực hiện', variant: 'default' },
    CHO_KET_QUA: { label: 'Chờ kết quả', variant: 'default' },
    HOAN_THANH: { label: 'Hoàn thành', variant: 'outline' },
    HUY_BO: { label: 'Hủy bỏ', variant: 'destructive' },
}

interface LabOrderDetailProps {
    id: number
}

export function LabOrderDetail({ id }: LabOrderDetailProps) {
    const navigate = useNavigate()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const labOrderQuery = useQuery({
        queryKey: ['lab-orders', id],
        queryFn: () => fetchLabOrderById(id),
    })

    // Mutation to update status to CHO_KET_QUA then fetch data with paramResults
    const completeTestMutation = useMutation({
        mutationFn: async () => {
            // Step 1: Update status to CHO_KET_QUA first
            await updateLabOrderStatus({
                id,
                status: 'CHO_KET_QUA'
            })

            // Step 2: Then call processLabOrder API to get data with paramResults populated
            return processLabOrder(id)
        },
        onSuccess: async () => {
            toast({
                title: 'Thành công',
                description: 'Đã hoàn thành xét nghiệm, vui lòng nhập kết quả',
            })
            // Refetch to get the latest data with paramResults
            await queryClient.invalidateQueries({ queryKey: ['lab-orders', id] })
        },
        onError: (error) => {
            console.error('Error completing test:', error)
            toast({
                title: 'Lỗi',
                description: 'Không thể hoàn thành xét nghiệm',
                variant: 'destructive',
            })
        },
    })

    const labOrder = labOrderQuery.data

    if (labOrderQuery.isLoading) {
        return (
            <>
                <Header fixed>
                    <GlobalSearch />
                    <HeaderActions />
                </Header>

                <Main className='flex flex-1 flex-col gap-6'>
                    <div className='space-y-4'>
                        <Skeleton className='h-10 w-64' />
                        <Skeleton className='h-96 w-full' />
                    </div>
                </Main>
            </>
        )
    }

    if (!labOrder) {
        return (
            <>
                <Header fixed>
                    <GlobalSearch />
                    <HeaderActions />
                </Header>

                <Main className='flex flex-1 flex-col items-center justify-center gap-4'>
                    <h2 className='text-2xl font-bold'>Không tìm thấy phiếu xét nghiệm</h2>
                    <Button onClick={() => navigate({ to: '/lab-orders' })}>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Quay lại danh sách
                    </Button>
                </Main>
            </>
        )
    }

    const status = labOrder.status
    const config = statusConfig[status] || { label: status, variant: 'outline' as const }
    const hasLabResult = !!labOrder.labResultResponse

    return (
        <>
            <Header fixed>
                <GlobalSearch />
                <HeaderActions />
            </Header>

            <Main className='flex flex-1 flex-col gap-6'>
                <div className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => navigate({ to: '/lab-orders' })}
                        >
                            <ArrowLeft className='mr-2 h-4 w-4' />
                            Quay lại
                        </Button>
                        <div>
                            <h2 className='text-2xl font-bold tracking-tight'>Chi tiết chỉ định xét nghiệm</h2>
                            <p className='text-muted-foreground'>Mã phiếu: {labOrder.code}</p>
                        </div>
                    </div>

                    {/* Button: "Đã xét nghiệm xong" when DANG_THUC_HIEN */}
                    {labOrder.status === 'DANG_THUC_HIEN' && (
                        <Button
                            onClick={() => completeTestMutation.mutate()}
                            disabled={completeTestMutation.isPending}
                        >
                            {completeTestMutation.isPending ? 'Đang cập nhật...' : 'Đã xét nghiệm xong'}
                        </Button>
                    )}
                </div>

                {/* Lab Order Information - Inline */}
                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle>Thông tin chỉ định</CardTitle>
                            <Badge variant={config.variant}>{config.label}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                            <div className='flex items-start gap-3'>
                                <FileText className='mt-1 h-5 w-5 text-muted-foreground' />
                                <div className='flex-1'>
                                    <p className='text-sm font-medium'>Tên xét nghiệm</p>
                                    <p className='text-sm text-muted-foreground'>{labOrder.healthPlanName}</p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <Stethoscope className='mt-1 h-5 w-5 text-muted-foreground' />
                                <div className='flex-1'>
                                    <p className='text-sm font-medium'>Phòng thực hiện</p>
                                    <p className='text-sm text-muted-foreground'>{labOrder.room}</p>
                                </div>
                            </div>

                            {labOrder.doctorPerformed && (
                                <div className='flex items-start gap-3'>
                                    <User className='mt-1 h-5 w-5 text-muted-foreground' />
                                    <div className='flex-1'>
                                        <p className='text-sm font-medium'>Bác sĩ thực hiện</p>
                                        <p className='text-sm text-muted-foreground'>{labOrder.doctorPerformed}</p>
                                    </div>
                                </div>
                            )}

                            {labOrder.doctorOrdered && (
                                <div className='flex items-start gap-3'>
                                    <User className='mt-1 h-5 w-5 text-muted-foreground' />
                                    <div className='flex-1'>
                                        <p className='text-sm font-medium'>Bác sĩ chỉ định</p>
                                        <p className='text-sm text-muted-foreground'>{labOrder.doctorOrdered}</p>
                                    </div>
                                </div>
                            )}

                            <div className='flex items-start gap-3'>
                                <Calendar className='mt-1 h-5 w-5 text-muted-foreground' />
                                <div className='flex-1'>
                                    <p className='text-sm font-medium'>Ngày chỉ định</p>
                                    <p className='text-sm text-muted-foreground'>
                                        {format(new Date(labOrder.orderDate), 'dd/MM/yyyy', { locale: vi })}
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <Clock className='mt-1 h-5 w-5 text-muted-foreground' />
                                <div className='flex-1'>
                                    <p className='text-sm font-medium'>Giờ chỉ định</p>
                                    <p className='text-sm text-muted-foreground'>
                                        {format(new Date(labOrder.orderDate), 'HH:mm', { locale: vi })}
                                    </p>
                                </div>
                            </div>

                            {labOrder.diagnosis && (
                                <div className='flex items-start gap-3 md:col-span-2'>
                                    <FileText className='mt-1 h-5 w-5 text-muted-foreground' />
                                    <div className='flex-1'>
                                        <p className='text-sm font-medium'>Chẩn đoán</p>
                                        <p className='text-sm text-muted-foreground'>{labOrder.diagnosis}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Lab Parameters Form/Table - Full Width */}
                <Card className='h-full'>
                    <CardHeader>
                        <CardTitle>Kết quả & Chỉ số xét nghiệm</CardTitle>
                        <CardDescription>
                            {labOrder.status === 'CHO_KET_QUA' && 'Nhập kết quả và các thông số xét nghiệm chi tiết'}
                            {labOrder.status === 'HOAN_THANH' && 'Kết quả và các thông số xét nghiệm'}
                            {(labOrder.status === 'CHO_THUC_HIEN' || labOrder.status === 'DANG_THUC_HIEN' || labOrder.status === 'HUY_BO') && 'Quản lý kết quả và chỉ số xét nghiệm'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='min-h-[400px]'>
                        {/* Show form when CHO_KET_QUA to input values */}
                        {labOrder.status === 'CHO_KET_QUA' && hasLabResult && labOrder.labResultResponse?.paramResults && (
                            <LabParamsForm
                                labOrderId={id}
                                paramResults={labOrder.labResultResponse.paramResults}
                                labResult={labOrder.labResultResponse}
                                onSuccess={() => {
                                    labOrderQuery.refetch()
                                }}
                            />
                        )}

                        {/* Show read-only results when HOAN_THANH */}
                        {labOrder.status === 'HOAN_THANH' && hasLabResult && (
                            <div className='space-y-6'>
                                {/* Lab Result Summary */}
                                <div className='space-y-4'>
                                    <h3 className='text-lg font-semibold'>Kết quả xét nghiệm</h3>

                                    <div className='rounded-lg bg-muted/50 p-4'>
                                        <p className='text-xs font-medium text-muted-foreground uppercase mb-2'>
                                            Ngày thực hiện
                                        </p>
                                        <p className='text-sm'>
                                            {format(new Date(labOrder.labResultResponse!.date), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </p>
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        {labOrder.labResultResponse!.resultDetails && (
                                            <div>
                                                <p className='text-sm font-medium mb-2'>Kết quả chi tiết</p>
                                                <div className='rounded-lg bg-muted/50 p-4'>
                                                    <p className='text-sm whitespace-pre-wrap'>
                                                        {labOrder.labResultResponse!.resultDetails}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {labOrder.labResultResponse!.summary && (
                                            <div>
                                                <p className='text-sm font-medium mb-2'>Kết luận</p>
                                                <div className='rounded-lg bg-muted/50 p-4'>
                                                    <p className='text-sm whitespace-pre-wrap'>
                                                        {labOrder.labResultResponse!.summary}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {labOrder.labResultResponse!.note && (
                                        <div>
                                            <p className='text-sm font-medium mb-2'>Ghi chú</p>
                                            <div className='rounded-lg bg-muted/50 p-4'>
                                                <p className='text-sm whitespace-pre-wrap'>
                                                    {labOrder.labResultResponse!.note}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {labOrder.labResultResponse!.explanation && (
                                        <div>
                                            <p className='text-sm font-medium mb-2'>Giải thích</p>
                                            <div className='rounded-lg bg-muted/50 p-4'>
                                                <p className='text-sm whitespace-pre-wrap'>
                                                    {labOrder.labResultResponse!.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lab Result Images */}
                                    {labOrder.labResultResponse!.urls && labOrder.labResultResponse!.urls.length > 0 && (
                                        <div>
                                            <p className='text-sm font-medium mb-2'>Ảnh kết quả xét nghiệm</p>
                                            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                                                {labOrder.labResultResponse!.urls.map((url, index) => (
                                                    <a
                                                        key={index}
                                                        href={url}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors'
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`Ảnh kết quả ${index + 1}`}
                                                            className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                                                        />
                                                        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors' />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Lab Parameters Table */}
                                <div>
                                    <h3 className='text-lg font-semibold mb-4'>Chỉ số xét nghiệm</h3>
                                    <LabParamsTable paramResults={labOrder.labResultResponse?.paramResults} />
                                </div>
                            </div>
                        )}

                        {/* Show placeholder for other statuses */}
                        {(labOrder.status === 'CHO_THUC_HIEN' || labOrder.status === 'DANG_THUC_HIEN' || labOrder.status === 'HUY_BO') && (
                            <div className='flex items-center justify-center h-full'>
                                <div className='text-center'>
                                    <p className='text-sm text-muted-foreground'>
                                        {labOrder.status === 'CHO_THUC_HIEN' && 'Chỉ định đang chờ thực hiện. Chưa có chỉ số xét nghiệm'}
                                        {labOrder.status === 'DANG_THUC_HIEN' && 'Đang thực hiện xét nghiệm. Hoàn thành xét nghiệm để xem chỉ số'}
                                        {labOrder.status === 'HUY_BO' && 'Chỉ định đã bị hủy'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Main>
        </>
    )
}
