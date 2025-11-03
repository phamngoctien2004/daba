import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Phone, FileText } from 'lucide-react'
import { useDepartmentDetail } from '../hooks/use-departments-crud'

type DepartmentDetailDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    departmentId: number | null
}

export function DepartmentDetailDialog({
    open,
    onOpenChange,
    departmentId,
}: DepartmentDetailDialogProps) {
    const { data: department, isLoading } = useDepartmentDetail(departmentId, open)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Chi tiết khoa</DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết về khoa khám bệnh
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='space-y-4'>
                        <Skeleton className='h-8 w-full' />
                        <Skeleton className='h-20 w-full' />
                        <Skeleton className='h-8 w-full' />
                    </div>
                ) : department ? (
                    <div className='space-y-6'>
                        {/* Basic Info */}
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium text-muted-foreground'>
                                    ID
                                </label>
                                <p className='text-base font-medium'>#{department.id}</p>
                            </div>

                            <div>
                                <label className='text-sm font-medium text-muted-foreground'>
                                    Tên khoa
                                </label>
                                <p className='text-base font-semibold'>{department.name}</p>
                            </div>

                            <div>
                                <label className='text-sm font-medium text-muted-foreground'>
                                    Mô tả
                                </label>
                                <div className='mt-1 flex items-start gap-2'>
                                    <FileText className='h-4 w-4 mt-1 text-muted-foreground' />
                                    <p className='text-base'>{department.description}</p>
                                </div>
                            </div>

                            <div>
                                <label className='text-sm font-medium text-muted-foreground'>
                                    Số điện thoại
                                </label>
                                <div className='mt-1 flex items-center gap-2'>
                                    <Phone className='h-4 w-4 text-muted-foreground' />
                                    <p className='text-base'>{department.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        <div className='rounded-lg bg-muted/50 p-4'>
                            <p className='text-sm text-muted-foreground'>
                                💡 API chi tiết khoa chưa được triển khai. Đây là dữ liệu mẫu.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                        Không tìm thấy thông tin khoa
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
