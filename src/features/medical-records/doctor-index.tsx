import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery, type QueryKey } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { MedicalRecordsTable } from './components/medical-records-table-view'
import { fetchDoctorMedicalRecords, type MedicalRecordStatus } from './api/medical-records'
import type { MedicalRecordsSearch } from './types'

const doctorMedicalRecordsRoute = getRouteApi('/_authenticated/doctor-medical-records/')
const doctorMedicalRecordsQueryBaseKey: QueryKey = ['doctor-medical-records']

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const createTodayIso = () => format(new Date(), 'yyyy-MM-dd')

const resolveKeyword = (value?: string | null) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const resolveStatus = (value?: MedicalRecordStatus[] | null) => {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined
  }

  return value[0]
}

export function DoctorMedicalRecordsManagement() {
  const search = doctorMedicalRecordsRoute.useSearch() as MedicalRecordsSearch
  const navigate = doctorMedicalRecordsRoute.useNavigate()
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my')

  const todayIso = useMemo(() => createTodayIso(), [])
  const resolvedDate = useMemo(() => {
    if (typeof search.date === 'string' && search.date.trim() !== '') {
      return search.date.trim()
    }

    return todayIso
  }, [search.date, todayIso])

  const keywordFilter = resolveKeyword(search.keyword)
  const statusFilter = resolveStatus(search.status)

  const page = Math.max(1, search.page ?? DEFAULT_PAGE)
  const pageSize = Math.max(1, search.pageSize ?? DEFAULT_PAGE_SIZE)

  // Query for "Phiếu khám của tôi" (isAllDepartment = false)
  const myMedicalRecordsInput = useMemo(
    () => ({
      keyword: keywordFilter,
      date: resolvedDate,
      status: statusFilter,
      isAllDepartment: false,
      page,
      limit: pageSize,
    }),
    [keywordFilter, resolvedDate, statusFilter, page, pageSize]
  )

  const myMedicalRecordsQuery = useQuery({
    queryKey: [...doctorMedicalRecordsQueryBaseKey, 'my', myMedicalRecordsInput],
    queryFn: () => fetchDoctorMedicalRecords(myMedicalRecordsInput),
    placeholderData: (previous) => previous,
    staleTime: 0, // Always refetch when tab is active
    enabled: activeTab === 'my',
  })

  // Query for "Phiếu khám chung" (isAllDepartment = true)
  const allMedicalRecordsInput = useMemo(
    () => ({
      keyword: keywordFilter,
      date: resolvedDate,
      status: statusFilter,
      isAllDepartment: true,
      page,
      limit: pageSize,
    }),
    [keywordFilter, resolvedDate, statusFilter, page, pageSize]
  )

  const allMedicalRecordsQuery = useQuery({
    queryKey: [...doctorMedicalRecordsQueryBaseKey, 'all', allMedicalRecordsInput],
    queryFn: () => fetchDoctorMedicalRecords(allMedicalRecordsInput),
    placeholderData: (previous) => previous,
    staleTime: 0, // Always refetch when tab is active
    enabled: activeTab === 'all',
  })

  // Refetch data when switching tabs
  useEffect(() => {
    if (activeTab === 'my') {
      myMedicalRecordsQuery.refetch()
    } else {
      allMedicalRecordsQuery.refetch()
    }
  }, [activeTab])

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      const dateString = date ? format(date, 'yyyy-MM-dd') : undefined
      navigate({
        search: (prev) => ({
          ...(prev as MedicalRecordsSearch),
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
        ...(prev as MedicalRecordsSearch),
        date: undefined,
      }),
    })
  }, [navigate])

  const handleViewDetail = useCallback(
    (id: string) => {
      navigate({ to: '/doctor-medical-records/$id', params: { id } })
    },
    [navigate]
  )

  const handleExamine = useCallback(
    (id: string) => {
      navigate({ to: '/doctor-medical-records/examine/$id', params: { id } })
    },
    [navigate]
  )

  // Get current data based on active tab
  const currentQuery = activeTab === 'my' ? myMedicalRecordsQuery : allMedicalRecordsQuery
  const medicalRecords = currentQuery.data?.medicalRecords ?? []
  const pagination = currentQuery.data?.pagination ?? {
    page,
    pageSize,
    total: medicalRecords.length,
    totalPages: medicalRecords.length > 0 ? 1 : 0,
  }

  const isLoading = currentQuery.isPending
  const isRefetching = currentQuery.isFetching && !currentQuery.isPending

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
            <h2 className='text-2xl font-bold tracking-tight'>Quản lý phiếu khám bệnh</h2>
            <p className='text-muted-foreground'>
              Theo dõi và quản lý phiếu khám bệnh của bạn.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'my' | 'all')}>
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger value='my'>Phiếu khám của tôi</TabsTrigger>
            <TabsTrigger value='all'>Phiếu khám chung</TabsTrigger>
          </TabsList>

          <TabsContent value='my' className='mt-4'>
            <MedicalRecordsTable
              data={medicalRecords}
              total={pagination.total}
              pageCount={pagination.totalPages}
              isLoading={isLoading}
              isRefetching={isRefetching}
              onViewDetail={handleViewDetail}
              onExamine={handleExamine}
              dateValue={resolvedDate}
              onDateChange={handleDateChange}
              onResetFilters={handleResetFilters}
              search={search}
              navigate={navigate as NavigateFn}
            />
          </TabsContent>

          <TabsContent value='all' className='mt-4'>
            <MedicalRecordsTable
              data={medicalRecords}
              total={pagination.total}
              pageCount={pagination.totalPages}
              isLoading={isLoading}
              isRefetching={isRefetching}
              onViewDetail={handleViewDetail}
              onExamine={handleExamine}
              dateValue={resolvedDate}
              onDateChange={handleDateChange}
              onResetFilters={handleResetFilters}
              search={search}
              navigate={navigate as NavigateFn}
            />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
