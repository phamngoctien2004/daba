import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { User } from '../api/users'

type UserDetailDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
}

const roleLabels: Record<string, string> = {
    ADMIN: 'Admin',
    BAC_SI: 'Bác sĩ',
    LE_TAN: 'Lễ tân',
    BENH_NHAN: 'Bệnh nhân',
}

export function UserDetailDialog({
    open,
    onOpenChange,
    user,
}: UserDetailDialogProps) {
    if (!user) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle>Chi tiết tài khoản</DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết về tài khoản #{user.id}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='grid grid-cols-3 items-center gap-4'>
                        <span className='font-medium text-muted-foreground'>ID:</span>
                        <span className='col-span-2'>#{user.id}</span>
                    </div>

                    <div className='grid grid-cols-3 items-center gap-4'>
                        <span className='font-medium text-muted-foreground'>Email:</span>
                        <span className='col-span-2'>{user.email}</span>
                    </div>

                    <div className='grid grid-cols-3 items-center gap-4'>
                        <span className='font-medium text-muted-foreground'>Tên:</span>
                        <span className='col-span-2'>
                            {user.name || <span className='text-muted-foreground'>Chưa cập nhật</span>}
                        </span>
                    </div>

                    <div className='grid grid-cols-3 items-center gap-4'>
                        <span className='font-medium text-muted-foreground'>Vai trò:</span>
                        <div className='col-span-2'>
                            <Badge variant='secondary'>{roleLabels[user.role] || user.role}</Badge>
                        </div>
                    </div>

                    {user.status !== undefined && (
                        <div className='grid grid-cols-3 items-center gap-4'>
                            <span className='font-medium text-muted-foreground'>Trạng thái:</span>
                            <div className='col-span-2'>
                                <Badge variant={user.status ? 'default' : 'destructive'}>
                                    {user.status ? 'Hoạt động' : 'Khóa'}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {user.createdAt && (
                        <div className='grid grid-cols-3 items-center gap-4'>
                            <span className='font-medium text-muted-foreground'>Ngày tạo:</span>
                            <span className='col-span-2'>
                                {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
