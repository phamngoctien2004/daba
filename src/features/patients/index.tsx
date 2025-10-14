import { useCallback, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery, type QueryKey } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { PatientsTable } from './components/patients-table-view'
import { CreatePatientDialog } from './components/create-patient-dialog'
import { fetchPatients } from './api/patients'
import type { PatientsSearch } from './types'

const patientsRoute = getRouteApi('/_authenticated/patients/')
const patientsQueryBaseKey: QueryKey = ['patients']

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const resolveKeyword = (value?: string | null) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function PatientsManagement() {
  const search = patientsRoute.useSearch() as PatientsSearch
  const navigate = patientsRoute.useNavigate()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const keywordFilter = resolveKeyword(search.keyword)

  const page = Math.max(1, search.page ?? DEFAULT_PAGE)
  const pageSize = Math.max(1, search.pageSize ?? DEFAULT_PAGE_SIZE)

  const queryInput = useMemo(
    () => ({
      keyword: keywordFilter,
      page,
      limit: pageSize,
    }),
    [keywordFilter, page, pageSize]
  )

  const patientsQuery = useQuery({
    queryKey: [...patientsQueryBaseKey, queryInput],
    queryFn: () => fetchPatients(queryInput),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  })

  const handleResetFilters = useCallback(() => {
    navigate({
      search: () => ({}),
    })
  }, [navigate])

  const handleViewDetail = useCallback(
    (id: number) => {
      console.log('View patient detail:', id)
      // TODO: Navigate to patient detail page when implemented
      // navigate({ to: '/patients/$id', params: { id: String(id) } })
    },
    [navigate]
  )

  const handleEdit = useCallback(
    (id: number) => {
      console.log('Edit patient:', id)
      // TODO: Open edit dialog or navigate to edit page
    },
    []
  )

  const patients = patientsQuery.data?.patients ?? []
  const pagination = patientsQuery.data?.pagination ?? {
    page,
    pageSize,
    total: patients.length,
    totalPages: patients.length > 0 ? 1 : 0,
  }

  const isLoading = patientsQuery.isPending
  const isRefetching = patientsQuery.isFetching && !patientsQuery.isPending

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
            <h2 className='text-2xl font-bold tracking-tight'>Quản lý bệnh nhân</h2>
            <p className='text-muted-foreground'>
              Theo dõi và quản lý thông tin bệnh nhân.
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            Thêm bệnh nhân
          </Button>
        </div>

        <PatientsTable
          data={patients}
          total={pagination.total}
          pageCount={pagination.totalPages}
          isLoading={isLoading}
          isRefetching={isRefetching}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onResetFilters={handleResetFilters}
          search={search}
          navigate={navigate as NavigateFn}
        />
      </Main>

      <CreatePatientDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  )
}
