import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { ClipboardList, Home, NotebookPen } from 'lucide-react'
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const parentRoute = getRouteApi('/_authenticated/appointments/')
export const createMedicalRecordRoutePath =
  '/_authenticated/appointments/create-medical-record/$appointmentId'

export const Route = createFileRoute(createMedicalRecordRoutePath as never)({
  component: AppointmentMedicalRecordRoute,
})

function AppointmentMedicalRecordRoute() {
  const { appointmentId } = Route.useParams()
  const navigateToAppointments = parentRoute.useNavigate()
  const parentSearch = parentRoute.useSearch()

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
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Home className='size-4' />
          <span>/</span>
          <Button
            variant='link'
            className='h-auto px-0 text-sm'
            onClick={() =>
              navigateToAppointments({
                to: '/_authenticated/appointments/',
                search: parentSearch,
              })
            }
          >
            Quản lý lịch khám
          </Button>
          <span>/</span>
          <span className='font-medium text-foreground'>Tạo phiếu khám</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <NotebookPen className='size-5 text-primary' />
              Tạo phiếu khám bệnh
            </CardTitle>
            <CardDescription>
              Màn hình demo – chức năng sẽ được triển khai trong giai đoạn tiếp theo.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 text-muted-foreground'>
            <p>
              Phiếu khám cho lịch hẹn có ID <strong>{appointmentId}</strong> sẽ được cấu hình tại đây.
            </p>
            <div className='flex flex-col gap-2 rounded-lg border border-dashed px-4 py-6 text-center text-sm sm:flex-row sm:items-center sm:justify-center sm:gap-4'>
              <ClipboardList className='mx-auto size-6 text-primary sm:mx-0' />
              <div className='space-y-1 text-left'>
                <p className='font-medium text-foreground'>Đang trong quá trình phát triển</p>
                <p>
                  Chúng tôi sẽ bổ sung form tạo phiếu khám, thông tin dịch vụ và các bước xử lý liên quan trong bản cập nhật sắp tới.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className='justify-end'>
            <Button
              variant='outline'
              onClick={() =>
                navigateToAppointments({
                  to: '/_authenticated/appointments/',
                  search: parentSearch,
                })
              }
            >
              Quay lại danh sách
            </Button>
          </CardFooter>
        </Card>
      </Main>
    </>
  )
}
