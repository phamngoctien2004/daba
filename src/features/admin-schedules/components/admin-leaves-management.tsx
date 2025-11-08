/**
 * Admin Leaves Management Component
 * Display and manage all doctor leave requests
 */

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface LeaveRequest {
    id: number
    doctorName: string
    startTime: string
    endTime: string
    date: string
    submitDate: string
    reason: string
    leaveStatus: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI'
    userApprover: string | null
}

const statusMap = {
    CHO_DUYET: { label: 'Chờ duyệt', variant: 'secondary' as const },
    DA_DUYET: { label: 'Đã duyệt', variant: 'default' as const },
    TU_CHOI: { label: 'Từ chối', variant: 'destructive' as const },
}

function getShiftLabel(startTime: string): string {
    if (startTime.startsWith('07:')) return 'Sáng'
    if (startTime.startsWith('12:')) return 'Chiều'
    if (startTime.startsWith('17:')) return 'Tối'
    return startTime
}

interface AdminLeavesManagementProps {
    leaves: LeaveRequest[]
    isLoading: boolean
    onApprove: (ids: number[], reason?: string) => void
    onReject: (ids: number[], reason: string) => void
}

export function AdminLeavesManagement({
    leaves,
    isLoading,
    onApprove,
    onReject,
}: AdminLeavesManagementProps) {
    const [approvalNote, setApprovalNote] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')

    // Don't group - display each shift as separate row
    // Sort by date and shift
    const sortedLeaves = useMemo(() => {
        return [...leaves].sort((a, b) => {
            // Sort by date first
            const dateCompare = a.date.localeCompare(b.date)
            if (dateCompare !== 0) return dateCompare

            // Then by shift order (SANG -> CHIEU -> TOI)
            const shiftOrder = { '07:00:00': 0, '12:00:00': 1, '17:00:00': 2 }
            return (shiftOrder[a.startTime as keyof typeof shiftOrder] || 0) -
                (shiftOrder[b.startTime as keyof typeof shiftOrder] || 0)
        })
    }, [leaves])

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Quản lý lịch nghỉ</CardTitle>
                    <CardDescription>Duyệt và quản lý đơn xin nghỉ của bác sĩ</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='flex items-center justify-center py-8'>
                        <div className='text-sm text-muted-foreground'>Đang tải...</div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (leaves.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Quản lý lịch nghỉ</CardTitle>
                    <CardDescription>Duyệt và quản lý đơn xin nghỉ của bác sĩ</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='flex items-center justify-center py-8'>
                        <div className='text-sm text-muted-foreground'>Không có đơn xin nghỉ nào</div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quản lý lịch nghỉ</CardTitle>
                <CardDescription>Duyệt và quản lý đơn xin nghỉ của bác sĩ</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bác sĩ</TableHead>
                                <TableHead>Ngày nghỉ</TableHead>
                                <TableHead>Ca nghỉ</TableHead>
                                <TableHead>Lý do</TableHead>
                                <TableHead>Ngày gửi</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className='w-[150px]'>Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedLeaves.map((leave) => {
                                const statusInfo = statusMap[leave.leaveStatus]
                                const shiftText = getShiftLabel(leave.startTime)

                                return (
                                    <TableRow key={leave.id}>
                                        <TableCell className='font-medium'>{leave.doctorName}</TableCell>
                                        <TableCell>
                                            {format(new Date(leave.date), 'dd/MM/yyyy', { locale: vi })}
                                        </TableCell>
                                        <TableCell>{shiftText}</TableCell>
                                        <TableCell className='max-w-[250px] truncate'>{leave.reason}</TableCell>
                                        <TableCell>
                                            {format(new Date(leave.submitDate), 'dd/MM/yyyy', { locale: vi })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {leave.leaveStatus === 'CHO_DUYET' && (
                                                <div className='flex items-center gap-1'>
                                                    {/* Approve Button */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant='ghost' size='icon' title='Duyệt'>
                                                                <Check className='h-4 w-4 text-green-600' />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Duyệt đơn xin nghỉ</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Bạn có chắc chắn muốn duyệt đơn nghỉ phép ca{' '}
                                                                    <strong>{shiftText}</strong> của{' '}
                                                                    <strong>{leave.doctorName}</strong> vào ngày{' '}
                                                                    {format(new Date(leave.date), 'dd/MM/yyyy', { locale: vi })}?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <div className='space-y-2'>
                                                                <Label>Ghi chú (tùy chọn)</Label>
                                                                <Textarea
                                                                    value={approvalNote}
                                                                    onChange={(e) => setApprovalNote(e.target.value)}
                                                                    placeholder='Nhập ghi chú...'
                                                                    rows={3}
                                                                />
                                                            </div>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel onClick={() => setApprovalNote('')}>
                                                                    Hủy
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => {
                                                                        onApprove([leave.id], approvalNote || undefined)
                                                                        setApprovalNote('')
                                                                    }}
                                                                >
                                                                    Duyệt
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    {/* Reject Button */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant='ghost' size='icon' title='Từ chối'>
                                                                <X className='h-4 w-4 text-red-600' />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Từ chối đơn xin nghỉ</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Vui lòng nhập lý do từ chối đơn nghỉ phép ca{' '}
                                                                    <strong>{shiftText}</strong> của{' '}
                                                                    <strong>{leave.doctorName}</strong>.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <div className='space-y-2'>
                                                                <Label>
                                                                    Lý do từ chối <span className='text-destructive'>*</span>
                                                                </Label>
                                                                <Textarea
                                                                    value={rejectionReason}
                                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                                    placeholder='Nhập lý do từ chối...'
                                                                    rows={3}
                                                                    required
                                                                />
                                                            </div>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel onClick={() => setRejectionReason('')}>
                                                                    Hủy
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    disabled={!rejectionReason.trim()}
                                                                    onClick={() => {
                                                                        if (rejectionReason.trim()) {
                                                                            onReject([leave.id], rejectionReason)
                                                                            setRejectionReason('')
                                                                        }
                                                                    }}
                                                                >
                                                                    Từ chối
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                            {leave.leaveStatus === 'DA_DUYET' && (
                                                <span className='text-xs text-muted-foreground'>
                                                    Đã duyệt
                                                </span>
                                            )}
                                            {leave.leaveStatus === 'TU_CHOI' && (
                                                <span className='text-xs text-muted-foreground'>
                                                    Đã từ chối
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
