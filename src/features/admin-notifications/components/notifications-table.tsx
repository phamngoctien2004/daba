/**
 * Admin Notifications Table Component
 */

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Send,
    Eye,
} from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { Notification } from '../types'
import { useDeleteNotification, useSendNotification } from '../hooks/use-notifications'

interface NotificationsTableProps {
    data: Notification[]
    isLoading?: boolean
    onEdit: (notification: Notification) => void
    onView: (notification: Notification) => void
}

export function NotificationsTable({ data, isLoading, onEdit, onView }: NotificationsTableProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [sendId, setSendId] = useState<number | null>(null)

    const { mutate: deleteMutation } = useDeleteNotification()
    const { mutate: sendMutation, isPending: isSending } = useSendNotification()

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation(deleteId)
            setDeleteId(null)
        }
    }

    const handleSend = () => {
        if (sendId) {
            sendMutation(sendId)
            setSendId(null)
        }
    }

    if (isLoading) {
        return (
            <div className='space-y-3'>
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className='h-16 w-full' />
                ))}
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className='flex h-[400px] items-center justify-center'>
                <p className='text-muted-foreground'>Chưa có thông báo nào</p>
            </div>
        )
    }

    return (
        <>
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[50px]'>ID</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead className='max-w-[400px]'>Nội dung</TableHead>
                            <TableHead>Hình ảnh</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead className='w-[180px] text-right'>Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((notification) => (
                            <TableRow key={notification.id}>
                                <TableCell className='font-medium'>{notification.id}</TableCell>
                                <TableCell>
                                    <div className='max-w-[300px] truncate font-medium'>
                                        {notification.title}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='max-w-[400px] truncate text-sm text-muted-foreground'>
                                        {notification.content}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {notification.image ? (
                                        <Badge variant='outline'>Có ảnh</Badge>
                                    ) : (
                                        <Badge variant='secondary'>Không có</Badge>
                                    )}
                                </TableCell>
                                <TableCell className='text-sm text-muted-foreground'>
                                    {format(new Date(notification.time), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                </TableCell>
                                <TableCell>
                                    <div className='flex items-center justify-end gap-2'>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => setSendId(notification.id)}
                                            disabled={isSending}
                                        >
                                            <Send className='mr-2 h-4 w-4' />
                                            Gửi
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant='ghost' size='sm'>
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end'>
                                                <DropdownMenuItem onClick={() => onView(notification)}>
                                                    <Eye className='mr-2 h-4 w-4' />
                                                    Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(notification)}>
                                                    <Pencil className='mr-2 h-4 w-4' />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className='text-destructive'
                                                    onClick={() => setDeleteId(notification.id)}
                                                >
                                                    <Trash2 className='mr-2 h-4 w-4' />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                handleConfirm={handleDelete}
                title='Xác nhận xóa'
                desc='Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác.'
                confirmText='Xóa'
                cancelBtnText='Hủy'
                destructive
            />

            <ConfirmDialog
                open={sendId !== null}
                onOpenChange={(open) => !open && setSendId(null)}
                handleConfirm={handleSend}
                title='Xác nhận gửi thông báo'
                desc='Bạn có chắc chắn muốn gửi thông báo này đến tất cả người dùng?'
                confirmText='Gửi'
                cancelBtnText='Hủy'
            />
        </>
    )
}
