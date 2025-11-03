import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Stethoscope, Filter, Download } from 'lucide-react'
import { format } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { ChatButton } from '@/components/chat-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useToast } from '@/hooks/use-toast'
import { DoctorFiltersComponent } from '@/features/admin-doctors/components/doctor-filters'
import { DoctorsTable } from '@/features/admin-doctors/components/doctors-table-view'
import { CreateDoctorDialog } from '@/features/admin-doctors/components/create-doctor-dialog'
import { EditDoctorDialog } from '@/features/admin-doctors/components/edit-doctor-dialog'
import { DeleteDoctorDialog } from '@/features/admin-doctors/components/delete-doctor-dialog'
import { DoctorDetailDialog } from '@/features/admin-doctors/components/doctor-detail-dialog'
import { useDoctors } from '@/features/admin-doctors/hooks/use-doctors'
import { useDelayedLoading } from '@/hooks/use-delayed-loading'
import type { DoctorFilters, DoctorDetail } from '@/features/admin-doctors/types'

function AdminDoctorsPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<DoctorFilters>({})

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetail | null>(null)

  const { data, isLoading } = useDoctors({
    page,
    size: pageSize,
    filters,
  })

  // Only show loading skeleton if request takes more than 1 second
  const showLoading = useDelayedLoading(isLoading, 1000)

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
    setCreateDialogOpen(true)
  }

  const handleExportData = () => {
    try {
      const doctors = data?.content || []
      if (doctors.length === 0) {
        toast({
          title: 'Không có dữ liệu',
          description: 'Không có bác sĩ nào để xuất',
          variant: 'destructive',
        })
        return
      }

      // Prepare CSV headers
      const headers = [
        'ID',
        'Họ và tên',
        'Email',
        'Số điện thoại',
        'Chuyên khoa',
        'Trình độ',
        'Giới tính',
        'Ngày sinh',
        'Địa chỉ',
      ]

      // Prepare CSV rows
      const rows = doctors.map((doctor) => [
        doctor.id,
        doctor.fullName || '',
        doctor.email || '',
        doctor.phoneNumber || '',
        doctor.specialization || '',
        doctor.qualifications || '',
        doctor.gender === 'MALE' ? 'Nam' : doctor.gender === 'FEMALE' ? 'Nữ' : 'Khác',
        doctor.dateOfBirth ? format(new Date(doctor.dateOfBirth), 'dd/MM/yyyy') : '',
        doctor.address || '',
      ])

      // Create CSV content with UTF-8 BOM for proper Vietnamese display in Excel
      const BOM = '\uFEFF'
      const csvContent =
        BOM +
        [headers, ...rows]
          .map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
          )
          .join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `danh-sach-bac-si-${format(new Date(), 'dd-MM-yyyy')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Xuất dữ liệu thành công',
        description: `Đã xuất ${doctors.length} bác sĩ`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Lỗi xuất dữ liệu',
        description: 'Đã xảy ra lỗi khi xuất dữ liệu',
        variant: 'destructive',
      })
    }
  }

  const handleCreateSuccess = () => {
    setPage(0) // Reset to first page after creating new doctor
  }

  const handleViewDetail = (doctor: DoctorDetail) => {
    setSelectedDoctor(doctor)
    setDetailDialogOpen(true)
  }

  const handleEdit = (doctor: DoctorDetail) => {
    setSelectedDoctor(doctor)
    setEditDialogOpen(true)
  }

  const handleDelete = (doctor: DoctorDetail) => {
    setSelectedDoctor(doctor)
    setDeleteDialogOpen(true)
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
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Stethoscope className="h-6 w-6" />
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Quản lý Bác sĩ</h2>
              <p className='text-muted-foreground'>Quản lý thông tin bác sĩ trong hệ thống</p>
            </div>
          </div>
          <Button onClick={handleExportData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất dữ liệu
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Bộ lọc</h3>
            </div>

            <DoctorFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
              onAddClick={handleCreateDoctor}
            />
          </div>

          <DoctorsTable
            data={data?.content || []}
            isLoading={showLoading}
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

        {/* Dialogs */}
        <CreateDoctorDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleCreateSuccess}
        />

        <DoctorDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          doctor={selectedDoctor}
        />

        <EditDoctorDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          doctor={selectedDoctor}
        />

        <DeleteDoctorDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          doctor={selectedDoctor}
        />
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/admin/doctors')({
  component: AdminDoctorsPage,
})
