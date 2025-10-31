import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin } from 'lucide-react'

type RoomDetailDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    roomId: number | null
}

export function RoomDetailDialog({
    open,
    onOpenChange,
    roomId,
}: RoomDetailDialogProps) {
    // Mock data - API chưa có
    const isLoading = false
    const room = roomId
        ? {
            roomId: roomId,
            roomNumber: '101A',
            roomName: 'Phòng khám Nội tổng quát',
            departmentName: 'Khoa Nội tổng hợp',
        }
        : null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Chi tiết phòng khám</DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết về phòng khám
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='space-y-4'>
                        <Skeleton className='h-8 w-full' />
                        <Skeleton className='h-20 w-full' />
                        <Skeleton className='h-8 w-full' />
                    </div>
                ) : room ? (
                    <div className='space-y-6'>
                        {/* Basic Info */}
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium text-muted-foreground'>
                                    ID
                                </label>
                                <p className='text-base font-medium'>#{room.roomId}</p>
                            </div>

                            <div>
                                <label className='text-sm font-medium text-muted-foreground'>
                                    Mã phòng
                                </label>
                                <div className='mt-1'>
                                    <Badge variant='outline' className='font-mono text-base'>
                                        {room.roomNumber}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <label className='text-sm font-medium text-muted-foreground'>
                                    Tên phòng
                                </label>
                                <div className='mt-1 flex items-start gap-2'>
                                    <MapPin className='h-5 w-5 mt-0.5 text-muted-foreground' />
                                    <p className='text-base font-semibold'>{room.roomName}</p>
                                </div>
                            </div>

                            <div>
                                <label className='text-sm font-medium text-muted-foreground'>
                                    Khoa
                                </label>
                                <div className='mt-1 flex items-center gap-2'>
                                    <Building2 className='h-5 w-5 text-muted-foreground' />
                                    <p className='text-base'>{room.departmentName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        <div className='rounded-lg bg-muted/50 p-4'>
                            <p className='text-sm text-muted-foreground'>
                                💡 API chi tiết phòng chưa được triển khai. Đây là dữ liệu mẫu.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                        Không tìm thấy thông tin phòng
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
