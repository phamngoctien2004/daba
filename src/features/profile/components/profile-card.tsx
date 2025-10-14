import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Mail, Phone, MapPin, Award, User as UserIcon } from 'lucide-react'
import type { User } from '../types'

interface ProfileCardProps {
  user: User
}

const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    ADMIN: 'Quản trị viên',
    LE_TAN: 'Lễ tân',
    BAC_SI: 'Bác sĩ',
    BENH_NHAN: 'Bệnh nhân',
  }
  return roleMap[role] || role
}

const getRoleVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    ADMIN: 'destructive',
    LE_TAN: 'default',
    BAC_SI: 'secondary',
    BENH_NHAN: 'outline',
  }
  return variantMap[role] || 'outline'
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return dateString
  }
}

const formatBirthDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

const getInitials = (name: string) => {
  const words = name.trim().split(' ')
  if (words.length >= 2) {
    return words[0][0] + words[words.length - 1][0]
  }
  return name.substring(0, 2)
}

export function ProfileCard({ user }: ProfileCardProps) {
  const initials = getInitials(user.name || user.email)

  return (
    <div className='space-y-6'>
      {/* Avatar and Basic Info */}
      <div className='flex items-start gap-4'>
        <Avatar className='h-20 w-20'>
          <AvatarImage src={user.doctor?.profileImage || undefined} alt={user.name} />
          <AvatarFallback className='text-xl'>
            {initials.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 space-y-2'>
          <div>
            <h2 className='text-2xl font-semibold'>{user.name || 'Chưa cập nhật'}</h2>
            <p className='text-sm text-muted-foreground'>{user.email}</p>
          </div>
          <div className='flex gap-2'>
            <Badge variant={getRoleVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
            <Badge variant={user.status ? 'default' : 'destructive'}>
              {user.status ? 'Đang hoạt động' : 'Không hoạt động'}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Thông tin cơ bản */}
      <div className='space-y-4'>
        <h3 className='text-sm font-medium'>Thông tin cơ bản</h3>
        <div className='space-y-3'>
          <div className='flex items-center gap-3 text-sm'>
            <Mail className='h-4 w-4 text-muted-foreground flex-shrink-0' />
            <div className='flex-1'>
              <p className='text-xs text-muted-foreground'>Email</p>
              <p className='font-medium'>{user.email}</p>
            </div>
          </div>
          {user.phone && (
            <div className='flex items-center gap-3 text-sm'>
              <Phone className='h-4 w-4 text-muted-foreground flex-shrink-0' />
              <div className='flex-1'>
                <p className='text-xs text-muted-foreground'>Số điện thoại</p>
                <p className='font-medium'>{user.phone}</p>
              </div>
            </div>
          )}
          <div className='flex items-center gap-3 text-sm'>
            <Calendar className='h-4 w-4 text-muted-foreground flex-shrink-0' />
            <div className='flex-1'>
              <p className='text-xs text-muted-foreground'>Ngày tạo tài khoản</p>
              <p className='font-medium'>{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin bác sĩ (nếu là bác sĩ) */}
      {user.role === 'BAC_SI' && user.doctor && (
        <>
          <Separator />
          <div className='space-y-4'>
            <h3 className='text-sm font-medium'>Thông tin bác sĩ</h3>
            <div className='space-y-3'>
              <div className='flex items-center gap-3 text-sm'>
                <UserIcon className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-xs text-muted-foreground'>Họ và tên</p>
                  <p className='font-medium'>{user.doctor.fullName}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 text-sm'>
                <Award className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-xs text-muted-foreground'>Chức vụ</p>
                  <p className='font-medium'>{user.doctor.position}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 text-sm'>
                <Phone className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-xs text-muted-foreground'>Số điện thoại</p>
                  <p className='font-medium'>{user.doctor.phone}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 text-sm'>
                <MapPin className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-xs text-muted-foreground'>Địa chỉ</p>
                  <p className='font-medium'>{user.doctor.address}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 text-sm'>
                <Calendar className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-xs text-muted-foreground'>Ngày sinh</p>
                  <p className='font-medium'>{formatBirthDate(user.doctor.birth)}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 text-sm'>
                <UserIcon className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-xs text-muted-foreground'>Giới tính</p>
                  <p className='font-medium'>
                    {user.doctor.gender === 'NAM' ? 'Nam' : user.doctor.gender === 'NU' ? 'Nữ' : 'Khác'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3 text-sm'>
                <Award className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-xs text-muted-foreground'>Kinh nghiệm</p>
                  <p className='font-medium'>{user.doctor.exp} năm</p>
                </div>
              </div>
              <div className='flex items-center gap-3 text-sm'>
                <div className='h-4 w-4 flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-xs text-muted-foreground'>Trạng thái làm việc</p>
                  <Badge variant={user.doctor.available ? 'default' : 'secondary'} className='mt-1'>
                    {user.doctor.available ? 'Đang làm việc' : 'Không có sẵn'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function ProfileCardSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Skeleton className='h-20 w-20 rounded-full' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-8 w-48' />
          <div className='flex gap-2'>
            <Skeleton className='h-6 w-24' />
            <Skeleton className='h-6 w-32' />
          </div>
        </div>
      </div>
      <Separator />
      <div className='space-y-3'>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
      </div>
    </div>
  )
}
