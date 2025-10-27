import { useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery, type QueryKey } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChatButton } from '@/components/chat-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { MedicalRecordsTable } from './components/medical-records-table-view'
import { fetchMedicalRecords, type MedicalRecordStatus } from './api/medical-records'
import type { MedicalRecordsSearch } from './types'

const medicalRecordsRoute = getRouteApi('/_authenticated/medical-records/')
const medicalRecordsQueryBaseKey: QueryKey = ['medical-records']

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

export function MedicalRecordsManagement() {
    const search = medicalRecordsRoute.useSearch() as MedicalRecordsSearch
    const navigate = medicalRecordsRoute.useNavigate()

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

    const queryInput = useMemo(
        () => ({
            keyword: keywordFilter,
            date: resolvedDate,
            status: statusFilter,
            page,
            limit: pageSize,
        }),
        [keywordFilter, resolvedDate, statusFilter, page, pageSize]
    )

    const medicalRecordsQuery = useQuery({
        queryKey: [...medicalRecordsQueryBaseKey, queryInput],
        queryFn: () => fetchMedicalRecords(queryInput),
        placeholderData: (previous) => previous,
        staleTime: 30_000,
    })

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
            navigate({ to: '/medical-records/$id', params: { id } })
        },
        [navigate]
    )

    const medicalRecords = medicalRecordsQuery.data?.medicalRecords ?? []
    const pagination = medicalRecordsQuery.data?.pagination ?? {
        page,
        pageSize,
        total: medicalRecords.length,
        totalPages: medicalRecords.length > 0 ? 1 : 0,
    }

    const isLoading = medicalRecordsQuery.isPending
    const isRefetching =
        medicalRecordsQuery.isFetching && !medicalRecordsQuery.isPending

    return (
        <>
            <Header fixed>
                <GlobalSearch />
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ChatButton />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Quản lý phiếu khám</h2>
                        <p className='text-muted-foreground'>
                            Theo dõi và quản lý phiếu khám bệnh của bệnh nhân.
                        </p>
                    </div>
                </div>

                <MedicalRecordsTable
                    data={medicalRecords}
                    total={pagination.total}
                    pageCount={pagination.totalPages}
                    isLoading={isLoading}
                    isRefetching={isRefetching}
                    onViewDetail={handleViewDetail}
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
