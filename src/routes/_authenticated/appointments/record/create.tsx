import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { ArrowLeft, Home } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateMedicalRecordForm } from '@/features/medical-records/components/create-medical-record-form'

const parentRoute = getRouteApi('/_authenticated/appointments/')

export const Route = createFileRoute('/_authenticated/appointments/record/create')({
  component: CreateMedicalRecordRoute,
})

function CreateMedicalRecordRoute() {
  const navigateToAppointments = parentRoute.useNavigate()

  const handleSuccess = () => {
    navigateToAppointments({
      to: '/appointments',
    })
  }

  const handleCancel = () => {
    navigateToAppointments({
      to: '/appointments',
    })
  }

  return (
    <>
      <Header fixed>
        <GlobalSearch />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Home className='size-4' />
            <span>/</span>
            <Button
              variant='link'
              className='h-auto px-0 text-sm'
              onClick={() =>
                navigateToAppointments({
                  to: '/appointments',
                })
              }
            >
              Quản lý lịch khám
            </Button>
            <span>/</span>
            <span className='font-medium text-foreground'>Tạo phiếu khám</span>
          </div>
          
          <Button
            variant='outline'
            onClick={handleCancel}
          >
            <ArrowLeft className='me-2 size-4' />
            Quay lại
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tạo phiếu khám bệnh</CardTitle>
            <CardDescription>
              Vui lòng kiểm tra và điền đầy đủ thông tin khám bệnh.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateMedicalRecordForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
