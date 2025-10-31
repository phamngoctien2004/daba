import { useCallback, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery, useMutation, type QueryKey } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ErrorDialog } from '@/components/error-dialog'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { LabOrdersTable } from './lab-orders-table'
import { fetchDoctorLabOrders, processLabOrder } from '../api/lab-orders'
import type { LabOrdersSearch, LabOrderStatus } from '../types'

const labOrdersRoute = getRouteApi('/_authenticated/lab-orders/')
const labOrdersQueryBaseKey: QueryKey = ['lab-orders']

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const resolveKeyword = (value?: string | null) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const resolveDate = (value?: string | null) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  // Default to today (using local timezone)
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const resolveStatus = (value?: LabOrderStatus[] | null) => {
  if (Array.isArray(value) && value.length > 0) {
    // Return first status if array has items
    return value[0]
  }
  // Default to CHO_THUC_HIEN
  return 'CHO_THUC_HIEN' as LabOrderStatus
}

export function LabOrdersManagement() {
  const search = labOrdersRoute.useSearch() as LabOrdersSearch
  const navigate = labOrdersRoute.useNavigate()
  const { toast } = useToast()

  const [errorDialog, setErrorDialog] = useState<{
    open: boolean
    message: string
  }>({
    open: false,
    message: '',
  })

  // Debounce keyword to avoid excessive API calls
  const rawKeyword = resolveKeyword(search.keyword)
  const keywordFilter = useDebounce(rawKeyword, 500)

  const dateFilter = resolveDate(search.date)
  const statusFilter = resolveStatus(search.status)

  const page = Math.max(1, search.page ?? DEFAULT_PAGE)
  const pageSize = Math.max(1, search.pageSize ?? DEFAULT_PAGE_SIZE)

  const queryInput = useMemo(
    () => ({
      keyword: keywordFilter,
      date: dateFilter,
      status: statusFilter,
      page,
      limit: pageSize,
    }),
    [keywordFilter, dateFilter, statusFilter, page, pageSize]
  )

  const labOrdersQuery = useQuery({
    queryKey: [...labOrdersQueryBaseKey, queryInput],
    queryFn: () => fetchDoctorLabOrders(queryInput),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  })

  const labOrders = labOrdersQuery.data?.labOrders ?? []
  const pagination = labOrdersQuery.data?.pagination ?? {
    page,
    pageSize,
    total: labOrders.length,
    totalPages: labOrders.length > 0 ? 1 : 0,
  }

  const isLoading = labOrdersQuery.isPending
  const isRefetching = labOrdersQuery.isFetching && !labOrdersQuery.isPending

  const handleResetFilters = useCallback(() => {
    // Format today's date in local timezone
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    navigate({
      search: () => ({
        date: todayStr,
        status: ['CHO_THUC_HIEN'],
      }),
    })
  }, [navigate])

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      // Format date in local timezone to avoid timezone shift issues
      const formatLocalDate = (d: Date) => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const newDate = date ? formatLocalDate(date) : formatLocalDate(new Date())
      navigate({
        search: (prev) => ({
          ...prev,
          date: newDate,
          page: 1, // Reset to first page when changing date
        }),
      })
    },
    [navigate]
  )

  const processLabOrderMutation = useMutation({
    mutationFn: processLabOrder,
    onSuccess: (data) => {
      toast({
        title: 'Thành công',
        description: 'Đã bắt đầu thực hiện xét nghiệm',
      })
      // Navigate to detail page
      navigate({ to: `/lab-orders/${data.id}` })
    },
    onError: (error: Error) => {
      console.error('❌ [processLabOrder] Error:', error)
      setErrorDialog({
        open: true,
        message: error.message || 'Không thể thực hiện xét nghiệm. Vui lòng thử lại.',
      })
    },
  })

  const handleProcessLabOrder = useCallback(
    (id: number) => {
      processLabOrderMutation.mutate(id)
    },
    [processLabOrderMutation]
  )

  const handleViewDetail = useCallback(
    (id: number) => {
      navigate({ to: `/lab-orders/${id}` })
    },
    [navigate]
  )

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
            <h2 className='text-2xl font-bold tracking-tight'>Chỉ định xét nghiệm</h2>
            <p className='text-muted-foreground'>
              Quản lý và theo dõi các phiếu xét nghiệm.
            </p>
          </div>
        </div>

        <LabOrdersTable
          data={labOrders}
          total={pagination.total}
          pageCount={pagination.totalPages}
          isLoading={isLoading}
          isRefetching={isRefetching}
          onViewDetail={handleViewDetail}
          onProcessLabOrder={handleProcessLabOrder}
          dateValue={dateFilter}
          onDateChange={handleDateChange}
          onResetFilters={handleResetFilters}
          search={search}
          navigate={navigate as NavigateFn}
        />
      </Main>

      <ErrorDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        message={errorDialog.message}
      />
    </>
  )
}
