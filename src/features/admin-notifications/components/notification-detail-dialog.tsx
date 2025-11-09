/**
 * Notification Detail Dialog
 */

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { Notification } from '../types'

interface NotificationDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    notification: Notification | null
}

export function NotificationDetailDialog({
    open,
    onOpenChange,
    notification,
}: NotificationDetailDialogProps) {
    if (!notification) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[600px]'>
                <DialogHeader>
                    <DialogTitle>Chi tiết thông báo</DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết về thông báo #{notification.id}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4'>
                    <div>
                        <label className='text-sm font-medium'>Tiêu đề</label>
                        <p className='mt-1 text-sm'>{notification.title}</p>
                    </div>

                    <div>
                        <label className='text-sm font-medium'>Nội dung</label>
                        <p className='mt-1 text-sm text-muted-foreground whitespace-pre-wrap'>
                            {notification.content}
                        </p>
                    </div>

                    {notification.image && (
                        <div>
                            <label className='text-sm font-medium'>Hình ảnh</label>
                            <div className='mt-2'>
                                <img
                                    src={notification.image}
                                    alt={notification.title}
                                    className='h-60 w-full rounded-lg object-cover'
                                />
                            </div>
                        </div>
                    )}

                    <div className='flex items-center gap-4'>
                        <div>
                            <label className='text-sm font-medium'>Thời gian tạo</label>
                            <p className='mt-1 text-sm text-muted-foreground'>
                                {format(new Date(notification.time), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                            </p>
                        </div>
                        <div>
                            <label className='text-sm font-medium'>Trạng thái</label>
                            <div className='mt-1'>
                                <Badge variant='outline'>Đã tạo</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
