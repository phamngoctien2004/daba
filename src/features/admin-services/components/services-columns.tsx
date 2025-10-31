import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import type { Service } from '../api/services'

type ColumnsOptions = {
    onViewDetail: (id: number) => void
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
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

export const getServicesColumns = ({
    onViewDetail,
    onEdit,
    onDelete,
}: ColumnsOptions): ColumnDef<Service>[] => [
        // Hidden filter columns
        {
            id: 'priceRange',
            accessorFn: (row) => row.price,
            header: 'Price Range Filter',
            filterFn: (row, id, value) => {
                const price = row.original.price
                const ranges = value as string[]

                return ranges.some((range) => {
                    switch (range) {
                        case 'under-1m':
                            return price < 1000000
                        case '1m-3m':
                            return price >= 1000000 && price < 3000000
                        case '3m-5m':
                            return price >= 3000000 && price < 5000000
                        case 'over-5m':
                            return price >= 5000000
                        default:
                            return false
                    }
                })
            },
            enableSorting: false,
        },
        {
            id: 'type',
            accessorKey: 'type',
            header: 'Type Filter',
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
            enableSorting: false,
        },
        {
            accessorKey: 'code',
            header: 'Mã dịch vụ',
            cell: ({ row }) => {
                return <div className='font-medium'>{row.original.code}</div>
            },
        },
        {
            accessorKey: 'name',
            header: 'Tên dịch vụ',
            cell: ({ row }) => {
                return (
                    <div>
                        <div className='font-medium'>{row.original.name}</div>
                        {row.original.roomName && (
                            <div className='text-sm text-muted-foreground'>{row.original.roomName}</div>
                        )}
                    </div>
                )
            },
        },
        {
            id: 'typeDisplay',
            accessorKey: 'type',
            header: 'Loại',
            cell: ({ row }) => {
                const type = row.original.type
                const label = serviceTypeLabels[type] || type
                const variant = serviceTypeVariants[type] || 'default'
                return <Badge variant={variant}>{label}</Badge>
            },
        },
        {
            accessorKey: 'price',
            header: 'Giá',
            cell: ({ row }) => {
                const price = row.original.price
                return (
                    <div className='font-medium'>
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                        }).format(price)}
                    </div>
                )
            },
        },
        {
            accessorKey: 'roomNumber',
            header: 'Phòng',
            cell: ({ row }) => {
                return <div>{row.original.roomNumber || '-'}</div>
            },
        },
        {
            accessorKey: 'description',
            header: 'Mô tả',
            cell: ({ row }) => {
                const description = row.original.description
                if (!description) return <div>-</div>

                return (
                    <div className='max-w-[300px] truncate' title={description}>
                        {description}
                    </div>
                )
            },
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => {
                const service = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <span className='sr-only'>Mở menu</span>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => onViewDetail(service.id)}>
                                <Eye className='mr-2 h-4 w-4' />
                                Xem chi tiết
                            </DropdownMenuItem>
                            {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(service.id)}>
                                    <Edit className='mr-2 h-4 w-4' />
                                    Chỉnh sửa
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(service.id)}
                                        className="text-destructive focus:text-destructive"
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

