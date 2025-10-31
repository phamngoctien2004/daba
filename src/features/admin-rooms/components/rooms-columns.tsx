import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import type { Room } from '../api/rooms'

type ColumnsOptions = {
    onViewDetail: (id: number) => void
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
}

export const getRoomsColumns = ({
    onViewDetail,
    onEdit,
    onDelete,
}: ColumnsOptions): ColumnDef<Room>[] => [
        // Hidden filter column for department
        {
            id: 'departmentId',
            accessorFn: () => '', // Dummy accessor
            header: 'Department Filter',
            enableSorting: false,
        },
        {
            accessorKey: 'roomId',
            header: 'ID',
            cell: ({ row }) => {
                return <div className='font-medium'>#{row.original.roomId}</div>
            },
        },
        {
            accessorKey: 'roomNumber',
            header: 'Mã phòng',
            cell: ({ row }) => {
                return (
                    <Badge variant='outline' className='font-mono'>
                        {row.original.roomNumber}
                    </Badge>
                )
            },
        },
        {
            accessorKey: 'roomName',
            header: 'Tên phòng',
            cell: ({ row }) => {
                return (
                    <div>
                        <div className='font-medium'>{row.original.roomName}</div>
                        <div className='text-sm text-muted-foreground'>
                            {row.original.departmentName}
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: 'departmentName',
            header: 'Khoa',
            cell: ({ row }) => {
                return <div>{row.original.departmentName}</div>
            },
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => {
                const room = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <span className='sr-only'>Mở menu</span>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => onViewDetail(room.roomId)}>
                                <Eye className='mr-2 h-4 w-4' />
                                Xem chi tiết
                            </DropdownMenuItem>
                            {onEdit && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onEdit(room.roomId)}>
                                        <Edit className='mr-2 h-4 w-4' />
                                        Chỉnh sửa
                                    </DropdownMenuItem>
                                </>
                            )}
                            {onDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(room.roomId)}
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
