import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useServiceDetail } from '../hooks/use-services-crud'

interface ServiceDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    serviceId: number | null
}

const serviceTypeLabels: Record<string, string> = {
    KHAC: 'Khác',
    DICH_VU: 'Dịch vụ',
    XET_NGHIEM: 'Xét nghiệm',
}

const serviceTypeVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
    KHAC: 'outline',
    DICH_VU: 'default',
    XET_NGHIEM: 'secondary',
}

export function ServiceDetailDialog({
    open,
    onOpenChange,
    serviceId,
}: ServiceDetailDialogProps) {
    const { data: service, isLoading } = useServiceDetail(serviceId, open)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Chi tiết dịch vụ</DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết về dịch vụ khám bệnh
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='space-y-4'>
                        <Skeleton className='h-4 w-full' />
                        <Skeleton className='h-4 w-3/4' />
                        <Skeleton className='h-4 w-1/2' />
                    </div>
                ) : service ? (
                    <div className='space-y-6'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <div className='text-sm font-medium text-muted-foreground'>
                                    Mã dịch vụ
                                </div>
                                <div className='mt-1 font-medium'>{service.code}</div>
                            </div>

                            <div>
                                <div className='text-sm font-medium text-muted-foreground'>
                                    Loại dịch vụ
                                </div>
                                <div className='mt-1'>
                                    <Badge variant={serviceTypeVariants[service.type] || 'default'}>
                                        {serviceTypeLabels[service.type] || service.type}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className='text-sm font-medium text-muted-foreground'>
                                Tên dịch vụ
                            </div>
                            <div className='mt-1 text-lg font-semibold'>{service.name}</div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <div className='text-sm font-medium text-muted-foreground'>
                                    Giá dịch vụ
                                </div>
                                <div className='mt-1 text-lg font-bold text-primary'>
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(service.price)}
                                </div>
                            </div>

                            <div>
                                <div className='text-sm font-medium text-muted-foreground'>
                                    Phòng khám
                                </div>
                                <div className='mt-1'>
                                    {service.roomName ? (
                                        <>
                                            <div className='text-sm text-muted-foreground'>
                                                {service.roomName}
                                            </div>
                                        </>
                                    ) : (
                                        <div className='text-sm text-muted-foreground'>Chưa xác định</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {service.description && (
                            <div>
                                <div className='text-sm font-medium text-muted-foreground mb-2'>
                                    Mô tả chi tiết
                                </div>
                                <div className='text-sm leading-relaxed bg-muted/50 p-4 rounded-lg'>
                                    {service.description}
                                </div>
                            </div>
                        )}

                        {/* Hiển thị sub-plans cho dịch vụ gói */}
                        {service.type === 'DICH_VU' && service.subPlans && service.subPlans.length > 0 && (
                            <div>
                                <div className='text-sm font-medium text-muted-foreground mb-3'>
                                    Dịch vụ trong gói ({service.subPlans.length})
                                </div>
                                <ScrollArea className='h-64 border rounded-lg'>
                                    <div className='space-y-3 p-4'>
                                        {service.subPlans.map((subPlan) => (
                                            <div
                                                key={subPlan.id}
                                                className='border-l-4 border-primary/30 pl-4 py-2 bg-muted/30 rounded-r'
                                            >
                                                <div className='flex items-start justify-between gap-4'>
                                                    <div className='flex-1'>
                                                        <div className='font-medium'>{subPlan.name}</div>
                                                        <div className='text-xs text-muted-foreground mt-1'>
                                                            {subPlan.code}
                                                        </div>
                                                        {subPlan.roomName && (
                                                            <div className='text-xs text-muted-foreground mt-1'>
                                                                📍 {subPlan.roomName}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className='text-right'>
                                                        <div className='font-semibold text-primary'>
                                                            {subPlan.price.toLocaleString()} VNĐ
                                                        </div>
                                                        <Badge variant='secondary' className='text-xs mt-1'>
                                                            {serviceTypeLabels[subPlan.type] || subPlan.type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                        Không tìm thấy thông tin dịch vụ
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

