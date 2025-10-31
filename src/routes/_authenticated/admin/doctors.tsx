import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Stethoscope, Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChatButton } from '@/components/chat-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { DoctorFiltersComponent } from '@/features/admin-doctors/components/doctor-filters'
import { DoctorsTable } from '@/features/admin-doctors/components/doctors-table-view'
import { useDoctors } from '@/features/admin-doctors/hooks/use-doctors'
import type { DoctorFilters, DoctorDetail } from '@/features/admin-doctors/types'

function AdminDoctorsPage() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<DoctorFilters>({})

  const { data, isLoading } = useDoctors({
    page,
    size: pageSize,
    filters,
  })

  const handleFiltersChange = (newFilters: DoctorFilters) => {
    setFilters(newFilters)
    setPage(0)
  }

  const handleResetFilters = () => {
    setFilters({})
    setPage(0)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleCreateDoctor = () => {
    // TODO: Open create dialog
    console.log('Create doctor')
  }

  const handleViewDetail = (doctor: DoctorDetail) => {
    // TODO: Open detail dialog
    console.log('View detail:', doctor)
  }

  const handleEdit = (doctor: DoctorDetail) => {
    // TODO: Open edit dialog
    console.log('Edit doctor:', doctor)
  }

  const handleDelete = (doctor: DoctorDetail) => {
    // TODO: Open delete confirmation
    console.log('Delete doctor:', doctor)
  }

  return (
    <>
      <Header fixed>
        <GlobalSearch />
        <div className='ms-auto flex items-center gap-1'>
          <ThemeSwitch />
          <ChatButton />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-center gap-2'>
          <Stethoscope className="h-6 w-6" />
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Quản lý Bác sĩ</h2>
            <p className='text-muted-foreground'>Quản lý thông tin bác sĩ trong hệ thống</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DoctorFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleResetFilters}
              />
            </div>
            <Button onClick={handleCreateDoctor} className="mt-9">
              <Plus className="mr-2 h-4 w-4" />
              Thêm bác sĩ
            </Button>
          </div>

          <DoctorsTable
            data={data?.content || []}
            isLoading={isLoading}
            page={page}
            pageSize={pageSize}
            totalPages={data?.totalPages || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/admin/doctors')({
  component: AdminDoctorsPage,
})
