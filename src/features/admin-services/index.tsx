import { useCallback, useMemo, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { ServicesTable } from './components/services-table-view'
import { ServiceDetailDialog } from './components/service-detail-dialog'
import { CreateServiceDialog } from './components/create-service-dialog'
import { EditServiceDialog } from './components/edit-service-dialog'
import { fetchServices, deleteService } from './api/services'
import type { ServicesSearch, Service } from './types'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
    const globalNavigate = useNavigate()
    const queryClient = useQueryClient()

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<Service | null>(null)

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
        staleTime: 30_000,
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
            const service = services.find((s) => s.id === id)
            if (service) {
                setSelectedService(service)
                setDetailDialogOpen(true)
            }
        },
        [services]
    )

    const handleEdit = useCallback(
        (id: number) => {
            const service = services.find((s) => s.id === id)
            if (service) {
                setSelectedService(service)
                setEditDialogOpen(true)
            }
        },
        [services]
    )

    const handleDelete = useCallback(
        (id: number) => {
            const service = services.find((s) => s.id === id)
            if (service) {
                setSelectedService(service)
                setDeleteDialogOpen(true)
            }
        },
        [services]
    )

    const deleteMutation = useMutation({
        mutationFn: deleteService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: servicesQueryBaseKey })
            toast.success('Đã xóa dịch vụ')
            setDeleteDialogOpen(false)
            setSelectedService(null)
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể xóa dịch vụ')
        },
    })

    const confirmDelete = () => {
        if (selectedService) {
            deleteMutation.mutate(selectedService.id)
        }
    }

    return (
        <>
            <div className='flex flex-wrap items-end justify-between gap-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Quản lý dịch vụ khám</h2>
                    <p className='text-muted-foreground'>
                        Theo dõi và quản lý thông tin dịch vụ khám bệnh.
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    Thêm dịch vụ
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
                service={selectedService}
            />

            <ServiceDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                serviceId={selectedService?.id ?? null}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa dịch vụ "{selectedService?.name}" không?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

