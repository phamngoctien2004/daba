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
import { DeleteDepartmentDialog } from './components/delete-department-dialog'
import { fetchDepartmentsList } from './api/departments-list'
import type { DepartmentsSearch } from './types-list'

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
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null)
    const [selectedDepartmentName, setSelectedDepartmentName] = useState<string>('')

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
        staleTime: 0, // Không cache - luôn fetch mới
        gcTime: 0, // Không giữ cache trong bộ nhớ
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
                setSelectedDepartmentId(id)
                setSelectedDepartmentName(department.name)
                setDetailDialogOpen(true)
            }
        },
        [departments]
    )

    const handleEdit = useCallback(
        (id: number) => {
            const department = departments.find((d) => d.id === id)
            if (department) {
                setSelectedDepartmentId(id)
                setSelectedDepartmentName(department.name)
                setEditDialogOpen(true)
            }
        },
        [departments]
    )

    const handleDelete = useCallback(
        (id: number) => {
            const department = departments.find((d) => d.id === id)
            if (department) {
                setSelectedDepartmentId(id)
                setSelectedDepartmentName(department.name)
                setDeleteDialogOpen(true)
            }
        },
        [departments]
    )

    const handleCreateSuccess = () => {
        // Reset to first page after creating
        navigate({ search: { ...search, page: DEFAULT_PAGE } })
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
                onSuccess={handleCreateSuccess}
            />

            <EditDepartmentDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                departmentId={selectedDepartmentId}
            />

            <DepartmentDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                departmentId={selectedDepartmentId}
            />

            <DeleteDepartmentDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                departmentId={selectedDepartmentId}
                departmentName={selectedDepartmentName}
            />
        </>
    )
}
