import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useMyLeaves, useDeleteLeave } from '../hooks/use-leaves'
import type { LeaveRequest } from '../types'

const statusMap = {
    CHO_DUYET: { label: 'Chờ duyệt', variant: 'secondary' as const },
    DA_DUYET: { label: 'Đã duyệt', variant: 'default' as const },
    TU_CHOI: { label: 'Từ chối', variant: 'destructive' as const },
}

/**
 * Convert startTime to shift label
 */
function getShiftLabel(startTime: string): string {
    if (startTime.startsWith('07:')) return 'Sáng'
    if (startTime.startsWith('12:')) return 'Chiều'
    if (startTime.startsWith('17:')) return 'Tối'
    return startTime
}

/**
 * Group leaves by date and combine shifts
 */
function groupLeavesByDate(leaves: LeaveRequest[]): Map<string, LeaveRequest[]> {
    const grouped = new Map<string, LeaveRequest[]>()

    leaves.forEach(leave => {
        const key = `${leave.date}-${leave.reason}` // Group by date + reason
        const existing = grouped.get(key) || []
        existing.push(leave)
        grouped.set(key, existing)
    })

    return grouped
}

interface LeavesListProps {
    status?: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI'
}

export function LeavesList({ status }: LeavesListProps) {
    const { data: leaves = [], isLoading } = useMyLeaves({ leaveStatus: status })
    const { mutate: deleteLeave } = useDeleteLeave()

    const handleDelete = (leaveGroup: LeaveRequest[]) => {
        // Delete all shifts in the group (same date + reason)
        leaveGroup.forEach(leave => {
            deleteLeave(leave.id)
        })
    }

    if (isLoading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='text-sm text-muted-foreground'>Đang tải...</div>
            </div>
        )
    }

    if (leaves.length === 0) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='text-sm text-muted-foreground'>Không có lịch nghỉ nào</div>
            </div>
        )
    }

    // Group leaves by date and reason to combine shifts
    const groupedLeaves = groupLeavesByDate(leaves)

    return (
        <div className='rounded-md border'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ngày nghỉ</TableHead>
                        <TableHead>Ca nghỉ</TableHead>
                        <TableHead>Lý do</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className='w-[100px]'>Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from(groupedLeaves.entries()).map(([key, leaveGroup]) => {
                        const firstLeave = leaveGroup[0]
                        const statusInfo = statusMap[firstLeave.leaveStatus]
                        const shiftsText = leaveGroup.map(l => getShiftLabel(l.startTime)).join(', ')

                        return (
                            <TableRow key={key}>
                                <TableCell>
                                    {format(new Date(firstLeave.date), 'dd/MM/yyyy', { locale: vi })}
                                </TableCell>
                                <TableCell>{shiftsText}</TableCell>
                                <TableCell className='max-w-[300px] truncate'>{firstLeave.reason}</TableCell>
                                <TableCell>
                                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                </TableCell>
                                <TableCell>
                                    {firstLeave.leaveStatus === 'CHO_DUYET' && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant='ghost' size='icon'>
                                                    <Trash2 className='h-4 w-4' />
                                                    <span className='sr-only'>Xóa</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Bạn có chắc chắn muốn xóa lịch nghỉ ngày {format(new Date(firstLeave.date), 'dd/MM/yyyy', { locale: vi })}
                                                        ({shiftsText})? Hành động này không thể hoàn tác.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(leaveGroup)}>
                                                        Xóa
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
