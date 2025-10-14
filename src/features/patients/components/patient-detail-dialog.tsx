import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Loader2, User, Phone, Mail, MapPin, Calendar, Users, Weight, Ruler, Droplet } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { usePatientDetail } from '../hooks/use-patient-detail'

interface PatientDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: number | null
}

export function PatientDetailDialog({
  open,
  onOpenChange,
  patientId,
}: PatientDetailDialogProps) {
  const { data: patient, isLoading, error } = usePatientDetail(patientId)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa có thông tin'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Chưa có thông tin'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi })
    } catch {
      return dateString
    }
  }

  const renderGender = (gender: string) => {
    if (gender === 'NAM') return 'Nam'
    if (gender === 'NU') return 'Nữ'
    return 'Khác'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Thông tin chi tiết bệnh nhân</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết và lịch sử của bệnh nhân
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        )}

        {error && (
          <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
            <p className='text-sm text-destructive'>
              Không thể tải thông tin bệnh nhân. Vui lòng thử lại.
            </p>
          </div>
        )}

        {patient && (
          <div className='space-y-6'>
            {/* Header with avatar and basic info */}
            <div className='flex items-start gap-4 pb-4 border-b'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary/10'>
                {patient.profileImage ? (
                  <img
                    src={patient.profileImage}
                    alt={patient.fullName}
                    className='h-20 w-20 rounded-full object-cover'
                  />
                ) : (
                  <User className='h-10 w-10 text-primary' />
                )}
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-3'>
                  <h3 className='text-2xl font-bold'>{patient.fullName}</h3>
                  {patient.verified && (
                    <Badge variant='default'>Đã xác thực</Badge>
                  )}
                </div>
                <p className='text-sm text-muted-foreground mt-1'>
                  Mã bệnh nhân: <span className='font-mono font-semibold'>{patient.code}</span>
                </p>
                <p className='text-sm text-muted-foreground'>
                  Ngày đăng ký: {formatDateTime(patient.registrationDate)}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
                Thông tin liên hệ
              </h4>
              <div className='grid gap-3'>
                <div className='flex items-center gap-3'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>
                    <span className='font-medium'>Số điện thoại:</span>{' '}
                    {patient.phone || 'Chưa có thông tin'}
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>
                    <span className='font-medium'>Email:</span>{' '}
                    {patient.email || 'Chưa có thông tin'}
                  </span>
                </div>
                <div className='flex items-start gap-3'>
                  <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                  <span className='text-sm'>
                    <span className='font-medium'>Địa chỉ:</span>{' '}
                    {patient.address || 'Chưa có thông tin'}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
                Thông tin cá nhân
              </h4>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center gap-3'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>
                    <span className='font-medium'>Giới tính:</span>{' '}
                    {renderGender(patient.gender)}
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>
                    <span className='font-medium'>Ngày sinh:</span>{' '}
                    {formatDate(patient.birth)}
                  </span>
                </div>
                <div className='flex items-start gap-3 col-span-2'>
                  <User className='h-4 w-4 text-muted-foreground mt-0.5' />
                  <span className='text-sm'>
                    <span className='font-medium'>Số CCCD:</span>{' '}
                    {patient.cccd || 'Chưa có thông tin'}
                  </span>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h4 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
                Thông tin y tế
              </h4>
              <div className='grid grid-cols-3 gap-4'>
                <div className='rounded-lg border p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Droplet className='h-4 w-4 text-red-500' />
                    <span className='text-xs font-medium text-muted-foreground'>Nhóm máu</span>
                  </div>
                  <p className='text-lg font-semibold'>
                    {patient.bloodType || 'Chưa xác định'}
                  </p>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Weight className='h-4 w-4 text-blue-500' />
                    <span className='text-xs font-medium text-muted-foreground'>Cân nặng</span>
                  </div>
                  <p className='text-lg font-semibold'>
                    {patient.weight ? `${patient.weight} kg` : 'Chưa có'}
                  </p>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Ruler className='h-4 w-4 text-green-500' />
                    <span className='text-xs font-medium text-muted-foreground'>Chiều cao</span>
                  </div>
                  <p className='text-lg font-semibold'>
                    {patient.height ? `${patient.height} cm` : 'Chưa có'}
                  </p>
                </div>
              </div>
            </div>

            {/* Relationship */}
            {patient.relationship && (
              <div>
                <h4 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
                  Thông tin khác
                </h4>
                <div className='flex items-center gap-3'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>
                    <span className='font-medium'>Quan hệ:</span>{' '}
                    {patient.relationship}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
