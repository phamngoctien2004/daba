import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useCurrentUser } from '@/features/profile/hooks/use-current-user'
import { ProfileCard, ProfileCardSkeleton } from '@/features/profile/components/profile-card'
import { ContentSection } from '../components/content-section'

export function SettingsProfile() {
  const { data: user, isLoading, error } = useCurrentUser()

  return (
    <ContentSection
      title='Hồ sơ cá nhân'
      desc='Xem thông tin tài khoản và hồ sơ cá nhân của bạn.'
    >
      <div>
        {isLoading && <ProfileCardSkeleton />}

        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
        )}

        {user && <ProfileCard user={user} />}

        {!isLoading && !error && !user && (
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Không tìm thấy thông tin</AlertTitle>
            <AlertDescription>
              Không tìm thấy thông tin hồ sơ của bạn.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </ContentSection>
  )
}
