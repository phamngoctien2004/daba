import { useCallback, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery, type QueryKey } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { DepartmentsTable } from './components/departments-table'
import { DepartmentDetailDialog } from './components/department-detail-dialog'
import { CreateDepartmentDialog } from './components/create-department-dialog'
import { EditDepartmentDialog } from './components/edit-department-dialog'
import { fetchDepartmentsList } from './api/departments-list'
import type { DepartmentsSearch } from './types-list'
import type { Department } from './api/departments-list'
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
import { toast } from 'sonner'

const departmentsRoute = getRouteApi('/_authenticated/admin/departments')
const departmentsQueryBaseKey: QueryKey = ['admin-departments-list']

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const resolveKeyword = (value: string | undefined): string | undefined => {
    if (!value) return undefined
    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
}

export function DepartmentsListManagement() {
    const search = departmentsRoute.useSearch() as DepartmentsSearch
    const navigate = departmentsRoute.useNavigate()

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

    // Debounce keyword to avoid excessive API calls
    const rawKeyword = resolveKeyword(search.keyword)
    const keywordFilter = useDebounce(rawKeyword, 500)

    const page = Math.max(1, search.page ?? DEFAULT_PAGE)
    const pageSize = Math.max(1, search.pageSize ?? DEFAULT_PAGE_SIZE)

    const queryInput = useMemo(() => {
        return {
            keyword: keywordFilter,
            page,
            size: pageSize,
        }
    }, [keywordFilter, page, pageSize])

    const departmentsQuery = useQuery({
        queryKey: [...departmentsQueryBaseKey, queryInput],
        queryFn: () => fetchDepartmentsList(queryInput),
        placeholderData: (previous) => previous,
        staleTime: 30_000,
    })

    const departments = departmentsQuery.data?.departments ?? []
    const pagination = departmentsQuery.data?.pagination ?? {
        page,
        pageSize,
        total: departments.length,
        totalPages: departments.length > 0 ? 1 : 0,
    }

    const isLoading = departmentsQuery.isPending
    const isRefetching = departmentsQuery.isFetching && !departmentsQuery.isPending

    const handleViewDetail = useCallback(
        (id: number) => {
            const department = departments.find((d) => d.id === id)
            if (department) {
                setSelectedDepartment(department)
                setDetailDialogOpen(true)
            }
        },
        [departments]
    )

    const handleEdit = useCallback(
        (id: number) => {
            const department = departments.find((d) => d.id === id)
            if (department) {
                setSelectedDepartment(department)
                setEditDialogOpen(true)
            }
        },
        [departments]
    )

    const handleDelete = useCallback(
        (id: number) => {
            const department = departments.find((d) => d.id === id)
            if (department) {
                setSelectedDepartment(department)
                setDeleteDialogOpen(true)
            }
        },
        [departments]
    )

    const confirmDelete = () => {
        if (selectedDepartment) {
            toast.info('API xóa khoa chưa được triển khai')
            setDeleteDialogOpen(false)
            setSelectedDepartment(null)
        }
    }

    return (
        <>
            <div className='flex flex-wrap items-end justify-between gap-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Quản lý khoa</h2>
                    <p className='text-muted-foreground'>
                        Theo dõi và quản lý thông tin các khoa khám bệnh.
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>Thêm khoa</Button>
            </div>

            <DepartmentsTable
                data={departments}
                total={pagination.total}
                pageCount={pagination.totalPages}
                isLoading={isLoading}
                isRefetching={isRefetching}
                onViewDetail={handleViewDetail}
                onEdit={handleEdit}
                onDelete={handleDelete}
                search={search}
                navigate={navigate as NavigateFn}
            />

            <CreateDepartmentDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            <EditDepartmentDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                department={selectedDepartment}
            />

            <DepartmentDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                departmentId={selectedDepartment?.id ?? null}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa khoa "{selectedDepartment?.name}" không? Hành
                            động này không thể hoàn tác.
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
