import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import type { Department } from '../api/departments-list'

type ColumnsOptions = {
    onViewDetail: (id: number) => void
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
}

export const getDepartmentsColumns = ({
    onViewDetail,
    onEdit,
    onDelete,
}: ColumnsOptions): ColumnDef<Department>[] => [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => {
                return <div className='font-medium'>#{row.original.id}</div>
            },
        },
        {
            accessorKey: 'name',
            header: 'Tên khoa',
            cell: ({ row }) => {
                return (
                    <div>
                        <div className='font-medium'>{row.original.name}</div>
                        {row.original.description && (
                            <div className='text-sm text-muted-foreground line-clamp-1'>
                                {row.original.description}
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'phone',
            header: 'Số điện thoại',
            cell: ({ row }) => {
                return <div>{row.original.phone}</div>
            },
        },
        {
            accessorKey: 'description',
            header: 'Mô tả',
            cell: ({ row }) => {
                const description = row.original.description
                if (!description) return <div>-</div>

                return (
                    <div className='max-w-[400px] truncate' title={description}>
                        {description}
                    </div>
                )
            },
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => {
                const department = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <span className='sr-only'>Mở menu</span>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => onViewDetail(department.id)}>
                                <Eye className='mr-2 h-4 w-4' />
                                Xem chi tiết
                            </DropdownMenuItem>
                            {onEdit && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onEdit(department.id)}>
                                        <Edit className='mr-2 h-4 w-4' />
                                        Chỉnh sửa
                                    </DropdownMenuItem>
                                </>
                            )}
                            {onDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(department.id)}
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
