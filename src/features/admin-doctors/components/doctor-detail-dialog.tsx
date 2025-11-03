import { useQuery } from '@tanstack/react-query'
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
import { Skeleton } from '@/components/ui/skeleton'
import { fetchDoctorById } from '../api/doctors'
import type { DoctorDetail } from '../types'

type DoctorDetailDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    doctor: DoctorDetail | null
}

export function DoctorDetailDialog({
    open,
    onOpenChange,
    doctor,
}: DoctorDetailDialogProps) {
    // Fetch full doctor details
    const { data: doctorDetails, isLoading } = useQuery({
        queryKey: ['doctor-detail', doctor?.id],
        queryFn: () => fetchDoctorById(doctor!.id),
        enabled: open && !!doctor?.id,
        staleTime: 0, // Always fetch fresh data
    })

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A'
        try {
            const [year, month, day] = dateString.split('-').map(Number)
            const date = new Date(year, month - 1, day)
            return format(date, 'dd/MM/yyyy', { locale: vi })
        } catch {
            return 'N/A'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Thông tin bác sĩ</DialogTitle>
                    <DialogDescription>
                        Chi tiết đầy đủ thông tin bác sĩ trong hệ thống
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='space-y-4'>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className='flex justify-between'>
                                <Skeleton className='h-4 w-32' />
                                <Skeleton className='h-4 w-48' />
                            </div>
                        ))}
                    </div>
                ) : doctorDetails ? (
                    <div className='space-y-6'>
                        {/* Personal Information */}
                        <div className='space-y-3'>
                            <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide'>
                                Thông tin cá nhân
                            </h3>
                            <div className='grid grid-cols-2 gap-4'>
                                <InfoItem label='Họ và tên' value={doctorDetails.fullName} />
                                <InfoItem label='Chức danh' value={doctorDetails.position} />
                                <InfoItem label='Số điện thoại' value={doctorDetails.phone} />
                                <InfoItem
                                    label='Giới tính'
                                    value={doctorDetails.gender === 'NAM' ? 'Nam' : 'Nữ'}
                                />
                                <InfoItem label='Ngày sinh' value={formatDate(doctorDetails.birth)} />
                                <InfoItem label='Kinh nghiệm' value={`${doctorDetails.exp} năm`} />
                            </div>
                            <InfoItem label='Địa chỉ' value={doctorDetails.address} fullWidth />
                        </div>

                        {/* Professional Information */}
                        <div className='space-y-3'>
                            <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide'>
                                Thông tin chuyên môn
                            </h3>
                            <div className='grid grid-cols-2 gap-4'>
                                <InfoItem
                                    label='Khoa'
                                    value={
                                        <Badge variant='outline'>{doctorDetails.departmentResponse.name}</Badge>
                                    }
                                />
                                <InfoItem
                                    label='Bằng cấp'
                                    value={doctorDetails.degreeResponse.degreeName}
                                />
                                <InfoItem
                                    label='Phí khám'
                                    value={`${doctorDetails.examinationFee.toLocaleString('vi-VN')} đ`}
                                />
                                <InfoItem
                                    label='Trạng thái'
                                    value={
                                        <Badge variant={doctorDetails.available ? 'default' : 'destructive'}>
                                            {doctorDetails.available ? 'Hoạt động' : 'Không hoạt động'}
                                        </Badge>
                                    }
                                />
                            </div>
                        </div>

                        {/* Workplace Information */}
                        <div className='space-y-3'>
                            <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide'>
                                Nơi làm việc
                            </h3>
                            <div className='grid grid-cols-2 gap-4'>
                                <InfoItem label='Số phòng' value={doctorDetails.roomNumber} />
                                <InfoItem label='Tên phòng' value={doctorDetails.roomName} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                        Không tìm thấy thông tin bác sĩ
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

// Helper component for info items
function InfoItem({
    label,
    value,
    fullWidth = false,
}: {
    label: string
    value: React.ReactNode
    fullWidth?: boolean
}) {
    return (
        <div className={fullWidth ? 'col-span-2' : ''}>
            <div className='text-sm font-medium text-muted-foreground mb-1'>{label}</div>
            <div className='text-sm font-semibold'>{value || 'N/A'}</div>
        </div>
    )
}
