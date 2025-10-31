import { useCallback, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery, type QueryKey } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { RoomsTable } from './components/rooms-table'
import { RoomDetailDialog } from './components/room-detail-dialog'
import { CreateRoomDialog } from './components/create-room-dialog'
import { EditRoomDialog } from './components/edit-room-dialog'
import { fetchRoomsList } from './api/rooms'
import { fetchDepartmentsForFilter, type Department } from './api/departments-filter'
import type { RoomsSearch } from './types'
import type { Room } from './api/rooms'
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

const roomsRoute = getRouteApi('/_authenticated/admin/rooms')
const roomsQueryBaseKey: QueryKey = ['admin-rooms']
const departmentsQueryBaseKey: QueryKey = ['departments-for-filter']

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const resolveKeyword = (value: string | undefined): string | undefined => {
    if (!value) return undefined
    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
}

const resolveDepartmentIds = (value: string | string[] | undefined): number[] | undefined => {
    if (typeof value === 'string') {
        const parsed = parseInt(value, 10)
        return isNaN(parsed) ? undefined : [parsed]
    }
    if (Array.isArray(value) && value.length > 0) {
        const parsed = value
            .map(v => parseInt(v, 10))
            .filter(n => !isNaN(n))
        return parsed.length > 0 ? parsed : undefined
    }
    return undefined
}

export function RoomsManagement() {
    const search = roomsRoute.useSearch() as RoomsSearch
    const navigate = roomsRoute.useNavigate()

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

    // Debounce keyword to avoid excessive API calls
    const rawKeyword = resolveKeyword(search.keyword)
    const keywordFilter = useDebounce(rawKeyword, 500)

    const departmentIdsFilter = resolveDepartmentIds(search.departmentId)
    const page = Math.max(1, search.page ?? DEFAULT_PAGE)
    const pageSize = Math.max(1, search.pageSize ?? DEFAULT_PAGE_SIZE)

    // Fetch departments for filter
    const departmentsQuery = useQuery({
        queryKey: departmentsQueryBaseKey,
        queryFn: fetchDepartmentsForFilter,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const departments = departmentsQuery.data ?? []
    const departmentOptions = useMemo(() => {
        return departments.map((dept: { id: number; name: string }) => ({
            label: dept.name,
            value: dept.id.toString(),
        }))
    }, [departments])

    const queryInput = useMemo(() => {
        const input: {
            keyword?: string
            departmentIds?: number[]
            page: number
            size: number
        } = {
            page,
            size: pageSize,
        }

        if (keywordFilter) {
            input.keyword = keywordFilter
        }

        if (departmentIdsFilter) {
            input.departmentIds = departmentIdsFilter
        }

        console.log('🔵 [RoomsManagement] queryInput:', input)
        console.log('🔵 [RoomsManagement] search.departmentId:', search.departmentId)
        console.log('🔵 [RoomsManagement] departmentIdsFilter:', departmentIdsFilter)

        return input
    }, [keywordFilter, departmentIdsFilter, page, pageSize, search.departmentId])

    const roomsQuery = useQuery({
        queryKey: [...roomsQueryBaseKey, queryInput],
        queryFn: () => fetchRoomsList(queryInput),
        placeholderData: (previous) => previous,
        staleTime: 30_000,
    })

    const rooms = roomsQuery.data?.rooms ?? []
    const pagination = roomsQuery.data?.pagination ?? {
        page,
        pageSize,
        total: rooms.length,
        totalPages: rooms.length > 0 ? 1 : 0,
    }

    const isLoading = roomsQuery.isPending
    const isRefetching = roomsQuery.isFetching && !roomsQuery.isPending

    const handleViewDetail = useCallback(
        (id: number) => {
            const room = rooms.find((r) => r.roomId === id)
            if (room) {
                setSelectedRoom(room)
                setDetailDialogOpen(true)
            }
        },
        [rooms]
    )

    const handleEdit = useCallback(
        (id: number) => {
            const room = rooms.find((r) => r.roomId === id)
            if (room) {
                setSelectedRoom(room)
                setEditDialogOpen(true)
            }
        },
        [rooms]
    )

    const handleDelete = useCallback(
        (id: number) => {
            const room = rooms.find((r) => r.roomId === id)
            if (room) {
                setSelectedRoom(room)
                setDeleteDialogOpen(true)
            }
        },
        [rooms]
    )

    const confirmDelete = () => {
        if (selectedRoom) {
            toast.info('API xóa phòng chưa được triển khai')
            setDeleteDialogOpen(false)
            setSelectedRoom(null)
        }
    }

    return (
        <>
            <div className='flex flex-wrap items-end justify-between gap-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Quản lý phòng khám</h2>
                    <p className='text-muted-foreground'>
                        Theo dõi và quản lý thông tin các phòng khám.
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>Thêm phòng</Button>
            </div>

            <RoomsTable
                data={rooms}
                total={pagination.total}
                pageCount={pagination.totalPages}
                isLoading={isLoading}
                isRefetching={isRefetching}
                onViewDetail={handleViewDetail}
                onEdit={handleEdit}
                onDelete={handleDelete}
                search={search}
                navigate={navigate as NavigateFn}
                departmentOptions={departmentOptions}
            />

            <CreateRoomDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                departments={departments}
            />

            <EditRoomDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                room={selectedRoom}
                departments={departments}
            />

            <RoomDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                roomId={selectedRoom?.roomId ?? null}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa phòng "{selectedRoom?.roomName}" không? Hành
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
