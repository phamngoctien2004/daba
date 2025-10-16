import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Patient } from '@/features/patients/api/patients'

type PatientInfoProps = {
  patient: Patient | null
}

export function PatientInfo({ patient }: PatientInfoProps) {
  if (!patient) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center text-muted-foreground'>
            Không tìm thấy thông tin bệnh nhân
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch {
      return dateString
    }
  }

  const formatGender = (gender: string | null) => {
    if (!gender) return '-'
    return gender === 'NAM' ? 'Nam' : gender === 'NU' ? 'Nữ' : 'Khác'
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>
                Mã bệnh nhân
              </label>
              <p className='text-sm font-semibold'>{patient.code}</p>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>Họ và tên</label>
              <p className='text-sm font-semibold'>{patient.fullName}</p>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>Ngày sinh</label>
              <p className='text-sm'>{formatDate(patient.birth)}</p>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>Giới tính</label>
              <p className='text-sm'>{formatGender(patient.gender)}</p>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>CCCD/CMND</label>
              <p className='text-sm'>{patient.cccd || '-'}</p>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>
                Số điện thoại
              </label>
              <p className='text-sm'>{patient.phone || '-'}</p>
            </div>

            <div className='space-y-1 md:col-span-2'>
              <label className='text-sm font-medium text-muted-foreground'>Địa chỉ</label>
              <p className='text-sm'>{patient.address || '-'}</p>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>Email</label>
              <p className='text-sm'>{patient.email || '-'}</p>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>
                Ngày đăng ký
              </label>
              <p className='text-sm'>{formatDate(patient.registrationDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin sức khỏe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>Nhóm máu</label>
              <div>
                {patient.bloodType ? (
                  <Badge variant='outline'>{patient.bloodType}</Badge>
                ) : (
                  <span className='text-sm text-muted-foreground'>-</span>
                )}
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>Cân nặng</label>
              <p className='text-sm'>
                {patient.weight ? `${patient.weight} kg` : '-'}
              </p>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>Chiều cao</label>
              <p className='text-sm'>
                {patient.height ? `${patient.height} cm` : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
