import { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { AppointmentsTable } from './components/appointments-table'
import {
  DEFAULT_APPOINTMENT_PAGE,
  DEFAULT_APPOINTMENT_PAGE_SIZE,
  confirmAppointment,
  fetchAppointments,
  type AppointmentStatus,
} from './api/appointments'
import type { AppointmentsSearch } from './types'

const appointmentsRoute = getRouteApi('/_authenticated/appointments/')
const appointmentsQueryBaseKey: QueryKey = ['appointments']

const createTodayIso = () => format(new Date(), 'yyyy-MM-dd')

const resolvePhone = (value?: string | null) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const resolveStatus = (value?: AppointmentStatus[] | null) => {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined
  }

  return value[0]
}

export function AppointmentsManagement() {
  const search = appointmentsRoute.useSearch() as AppointmentsSearch
  const navigate = appointmentsRoute.useNavigate()
  const globalNavigate = useNavigate()
  const queryClient = useQueryClient()

  const todayIso = useMemo(() => createTodayIso(), [])
  const resolvedDate = useMemo(() => {
    if (typeof search.date === 'string' && search.date.trim() !== '') {
      return search.date.trim()
    }

    return todayIso
  }, [search.date, todayIso])

  const phoneFilter = resolvePhone(search.phone)
  const statusFilter = resolveStatus(search.status)

  const page = Math.max(1, search.page ?? DEFAULT_APPOINTMENT_PAGE)
  const pageSize = Math.max(1, search.pageSize ?? DEFAULT_APPOINTMENT_PAGE_SIZE)

  const queryInput = useMemo(
    () => ({
      phone: phoneFilter,
      date: resolvedDate,
      status: statusFilter,
      page,
      pageSize,
    }),
    [phoneFilter, resolvedDate, statusFilter, page, pageSize]
  )

  const appointmentsQuery = useQuery({
    queryKey: [...appointmentsQueryBaseKey, queryInput],
    queryFn: () => fetchAppointments(queryInput),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  })

  const [_pendingAppointmentId, setPendingAppointmentId] =
    useState<number | null>(null)

  const { mutate: mutateAppointmentStatus, isPending: _isConfirmPending } =
    useMutation({
      mutationFn: confirmAppointment,
      onMutate: ({ id }) => {
        setPendingAppointmentId(id)
      },
      onSuccess: (result) => {
        if (result.message) {
          toast.success(result.message)
        }
        void queryClient.invalidateQueries({ queryKey: appointmentsQueryBaseKey })
      },
      onError: (error) => {
        const message =
          error instanceof Error
            ? error.message
            : 'Không thể cập nhật trạng thái. Vui lòng thử lại.'
        toast.error(message)
      },
      onSettled: () => {
        setPendingAppointmentId(null)
      },
    })

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      const dateString = date ? format(date, 'yyyy-MM-dd') : undefined
      navigate({
        search: (prev) => ({
          ...(prev as AppointmentsSearch),
          date: dateString,
          page: undefined,
        }),
      })
    },
    [navigate]
  )

  const handleResetFilters = useCallback(() => {
    navigate({
      search: (prev) => ({
        ...(prev as AppointmentsSearch),
        date: undefined,
      }),
    })
  }, [navigate])

  const appointments = appointmentsQuery.data?.appointments ?? []
  const pagination = appointmentsQuery.data?.pagination ?? {
    page,
    pageSize,
    total: appointments.length,
    totalPages: appointments.length > 0 ? 1 : 0,
  }

  const handleOpenMedicalRecord = useCallback(
    (appointmentId: number) => {
      // Find the appointment in current data
      const appointment = appointments.find((apt) => apt.id === appointmentId)

      if (appointment) {
        console.log('🔵 [handleOpenMedicalRecord] Appointment found:', appointment)

        // First, update appointment status to HOAN_THANH via API
        mutateAppointmentStatus(
          { id: appointmentId, status: 'HOAN_THANH' },
          {
            onSuccess: () => {
              console.log('✅ [handleOpenMedicalRecord] Status updated to HOAN_THANH')

              // After successful status update, proceed with medical record creation
              import('@/lib/appointment-storage').then(
                ({ clearAppointmentForMedicalRecord, saveAppointmentForMedicalRecord }) => {
                  // Clear previous data
                  clearAppointmentForMedicalRecord()
                  console.log('🗑️ [handleOpenMedicalRecord] Cleared old appointment data')

                  // Prepare new appointment data using patientResponse structure
                  const appointmentData = {
                    appointmentId: appointment.id,
                    patientId: appointment.patientResponse.id,
                    patientName: appointment.patientResponse.fullName,
                    patientPhone: appointment.patientResponse.phone,
                    patientEmail: appointment.patientResponse.email,
                    patientGender: appointment.patientResponse.gender,
                    patientBirth: appointment.patientResponse.birth,
                    patientAddress: appointment.address ?? null,
                    doctorId: appointment.doctorResponse?.id ?? null,
                    doctorName: appointment.doctorResponse?.position ?? null,
                    departmentId: appointment.departmentResponse?.id ?? null,
                    departmentName: appointment.departmentResponse?.name ?? null,
                    healthPlanId: appointment.healthPlanResponse?.id ?? null,
                    healthPlanName: appointment.healthPlanResponse?.name ?? null,
                    symptoms: appointment.symptoms,
                    appointmentDate: appointment.date,
                    appointmentTime: appointment.time,
                    // Payment info (đã thanh toán khi đặt lịch)
                    isPaidFromAppointment: appointment.status === 'DA_XAC_NHAN' && !!appointment.invoiceCode,
                    totalAmount: appointment.totalAmount ?? 0,
                    invoiceCode: appointment.invoiceCode ?? null,
                  }

                  console.log('💾 [handleOpenMedicalRecord] Saving new appointment data:', appointmentData)
                  // Save new data
                  saveAppointmentForMedicalRecord(appointmentData)

                  // Navigate after saving
                  globalNavigate({
                    to: '/appointments/record/create',
                  })
                }
              )
            },
            onError: (error) => {
              const message =
                error instanceof Error
                  ? error.message
                  : 'Không thể cập nhật trạng thái lịch khám. Vui lòng thử lại.'
              toast.error(message)
            },
          }
        )
      } else {
        // No appointment found, still navigate but show warning
        console.warn('⚠️ [handleOpenMedicalRecord] Appointment not found:', appointmentId)
        globalNavigate({
          to: '/appointments/record/create',
        })
      }
    },
    [globalNavigate, appointments, mutateAppointmentStatus]
  )

  // Note: handlePrintInvoice removed - no longer needed with 3-status system
  // Old 4-status system had: CHO_XAC_NHAN -> DA_XAC_NHAN -> DA_DEN -> KHONG_DEN
  // New 3-status system: DA_XAC_NHAN -> DANG_KHAM or KHONG_DEN

  const isLoading = appointmentsQuery.isPending
  const isRefetching =
    appointmentsQuery.isFetching && !appointmentsQuery.isPending

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
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Quản lý lịch khám</h2>
            <p className='text-muted-foreground'>
              Theo dõi và cập nhật trạng thái lịch khám của bệnh nhân.
            </p>
          </div>
        </div>

        <AppointmentsTable
          data={appointments}
          total={pagination.total}
          pageCount={pagination.totalPages}
          isLoading={isLoading}
          isRefetching={isRefetching}
          onOpenMedicalRecord={handleOpenMedicalRecord}
          dateValue={resolvedDate}
          onDateChange={handleDateChange}
          onResetFilters={handleResetFilters}
          search={search}
          navigate={navigate as NavigateFn}
        />
      </Main>
    </>
  )
}

