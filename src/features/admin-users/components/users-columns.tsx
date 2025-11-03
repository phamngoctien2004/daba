import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Eye, Edit, Trash2, KeyRound } from 'lucide-react'
import type { User } from '../api/users'

type UsersColumnsProps = {
    onViewDetail: (id: number) => void
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
    onResetPassword?: (id: number) => void
}

const roleLabels: Record<string, string> = {
    ADMIN: 'Admin',
    BAC_SI: 'Bác sĩ',
    LE_TAN: 'Lễ tân',
    BENH_NHAN: 'Bệnh nhân',
}

const roleVariants: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    ADMIN: 'default',
    BAC_SI: 'secondary',
    LE_TAN: 'outline',
    BENH_NHAN: 'secondary',
}

export function getUsersColumns({
    onViewDetail,
    onEdit,
    onDelete,
    onResetPassword,
}: UsersColumnsProps): ColumnDef<User>[] {
    return [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => <div className='font-medium'>#{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => <div>{row.getValue('email')}</div>,
        },
        {
            accessorKey: 'name',
            header: 'Tên',
            cell: ({ row }) => {
                const name = row.getValue('name') as string
                return <div>{name || <span className='text-muted-foreground'>—</span>}</div>
            },
        },
        {
            accessorKey: 'role',
            header: 'Vai trò',
            cell: ({ row }) => {
                const role = row.getValue('role') as string
                return (
                    <Badge variant={roleVariants[role] || 'default'}>
                        {roleLabels[role] || role}
                    </Badge>
                )
            },
            filterFn: (row, id, value) => {
                if (!value) return true
                const role = row.getValue(id) as string
                return role === value
            },
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => {
                const status = row.getValue('status') as boolean | undefined
                if (status === undefined) return <span className='text-muted-foreground'>—</span>
                return (
                    <Badge variant={status ? 'default' : 'destructive'}>
                        {status ? 'Hoạt động' : 'Khóa'}
                    </Badge>
                )
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <span className='sr-only'>Mở menu</span>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onViewDetail(user.id)}>
                                <Eye className='mr-2 h-4 w-4' />
                                Xem chi tiết
                            </DropdownMenuItem>
                            {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(user.id)}>
                                    <Edit className='mr-2 h-4 w-4' />
                                    Chỉnh sửa
                                </DropdownMenuItem>
                            )}
                            {onResetPassword && (
                                <DropdownMenuItem onClick={() => onResetPassword(user.id)}>
                                    <KeyRound className='mr-2 h-4 w-4' />
                                    Thiết lập mật khẩu
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(user.id)}
                                        className='text-destructive focus:text-destructive'
                                    >
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        Xóa
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}
