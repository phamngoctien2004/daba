import { useCallback, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery, type QueryKey } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { ServicesTable } from './components/services-table-view'
import { ServiceDetailDialog } from './components/service-detail-dialog'
import { CreateServiceDialog } from './components/create-service-dialog'
import { EditServiceDialog } from './components/edit-service-dialog'
import { DeleteServiceDialog } from './components/delete-service-dialog'
import { fetchServices } from './api/services'
import type { ServicesSearch } from './types'

const servicesRoute = getRouteApi('/_authenticated/admin/services')
const servicesQueryBaseKey: QueryKey = ['admin-services']

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const resolveKeyword = (value: string | undefined): string | undefined => {
    if (!value) return undefined
    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
}

export function ServicesManagement() {
    const search = servicesRoute.useSearch() as ServicesSearch
    const navigate = servicesRoute.useNavigate()

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
    const [selectedServiceName, setSelectedServiceName] = useState('')

    // Debounce keyword to avoid excessive API calls
    const rawKeyword = resolveKeyword(search.keyword)
    const keywordFilter = useDebounce(rawKeyword, 500)

    const page = Math.max(1, search.page ?? DEFAULT_PAGE)
    const pageSize = Math.max(1, search.pageSize ?? DEFAULT_PAGE_SIZE)

    const queryInput = useMemo(() => {
        // Convert priceRange filter to priceFrom/priceTo
        let priceFrom: number | undefined
        let priceTo: number | undefined

        if (search.priceRange && Array.isArray(search.priceRange) && search.priceRange.length > 0) {
            // Get the range bounds from all selected ranges
            const ranges = search.priceRange as string[]
            const bounds = ranges.map(range => {
                switch (range) {
                    case 'under-1m': return { from: 0, to: 999999 }
                    case '1m-3m': return { from: 1000000, to: 2999999 }
                    case '3m-5m': return { from: 3000000, to: 4999999 }
                    case 'over-5m': return { from: 5000000, to: 999999999 }
                    default: return null
                }
            }).filter(Boolean) as Array<{ from: number; to: number }>

            if (bounds.length > 0) {
                priceFrom = Math.min(...bounds.map(b => b.from))
                priceTo = Math.max(...bounds.map(b => b.to))
            }
        }

        // Get first type if array
        const typeFilter = search.type && Array.isArray(search.type) && search.type.length > 0
            ? search.type[0]
            : undefined

        return {
            keyword: keywordFilter,
            priceFrom,
            priceTo,
            type: typeFilter,
            page,
            limit: pageSize,
        }
    }, [keywordFilter, search.priceRange, search.type, page, pageSize])

    const servicesQuery = useQuery({
        queryKey: [...servicesQueryBaseKey, queryInput],
        queryFn: () => fetchServices(queryInput),
        placeholderData: (previous) => previous,
        staleTime: 0, // Không cache - luôn fetch mới
        gcTime: 0, // Không giữ cache trong bộ nhớ
    })

    const services = servicesQuery.data?.services ?? []
    const pagination = servicesQuery.data?.pagination ?? {
        page,
        pageSize,
        total: services.length,
        totalPages: services.length > 0 ? 1 : 0,
    }

    const isLoading = servicesQuery.isPending
    const isRefetching = servicesQuery.isFetching && !servicesQuery.isPending

    const handleResetFilters = useCallback(() => {
        navigate({
            search: () => ({}),
        })
    }, [navigate])

    const handleViewDetail = useCallback(
        (id: number) => {
            setSelectedServiceId(id)
            setDetailDialogOpen(true)
        },
        []
    )

    const handleEdit = useCallback(
        (id: number) => {
            setSelectedServiceId(id)
            setEditDialogOpen(true)
        },
        []
    )

    const handleDelete = useCallback(
        (id: number) => {
            const service = services.find((s) => s.id === id)
            if (service) {
                setSelectedServiceId(id)
                setSelectedServiceName(service.name)
                setDeleteDialogOpen(true)
            }
        },
        [services]
    )

    const handleExport = useCallback(() => {
        // Export data to CSV
        if (services.length === 0) {
            alert('Không có dữ liệu để xuất')
            return
        }

        const headers = ['ID', 'Tên dịch vụ', 'Loại', 'Giá (VNĐ)', 'Mô tả']
        const rows = services.map(service => [
            service.id,
            service.name,
            service.type === 'DICH_VU' ? 'Dịch vụ' :
                service.type === 'XET_NGHIEM' ? 'Xét nghiệm' : 'Khác',
            service.price,
            service.description || ''
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `dich-vu-kham-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, [services])

    return (
        <>
            <div className='flex flex-wrap items-end justify-between gap-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Quản lý dịch vụ khám</h2>
                    <p className='text-muted-foreground'>
                        Theo dõi và quản lý thông tin dịch vụ khám bệnh.
                    </p>
                </div>
                <Button onClick={handleExport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Xuất dữ liệu
                </Button>
            </div>

            <ServicesTable
                data={services}
                total={pagination.total}
                pageCount={pagination.totalPages}
                isLoading={isLoading}
                isRefetching={isRefetching}
                onViewDetail={handleViewDetail}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onResetFilters={handleResetFilters}
                onCreateNew={() => setCreateDialogOpen(true)}
                search={search}
                navigate={navigate as NavigateFn}
            />

            <CreateServiceDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            <EditServiceDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                serviceId={selectedServiceId}
            />

            <ServiceDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                serviceId={selectedServiceId}
            />

            <DeleteServiceDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                serviceId={selectedServiceId}
                serviceName={selectedServiceName}
            />
        </>
    )
}

