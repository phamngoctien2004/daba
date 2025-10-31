import { useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { UsersTable } from './components/users-table'
import { UserDetailDialog } from './components/user-detail-dialog'
import { CreateUserDialog } from './components/create-user-dialog'
import { fetchUsersList } from './api/users'
import type { UsersSearch, UserRole } from './types'
import type { User } from './api/users'
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

const usersRoute = getRouteApi('/_authenticated/admin/users')

const usersQueryBaseKey = ['admin', 'users']
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const resolveKeyword = (keyword: string | undefined): string => {
  if (typeof keyword === 'string') return keyword.trim()
  return ''
}

const resolveRole = (value: string | undefined): UserRole | undefined => {
  if (typeof value === 'string' && ['BAC_SI', 'LE_TAN', 'BENH_NHAN', 'ADMIN'].includes(value)) {
    return value as UserRole
  }
  return undefined
}

export function UsersManagement() {
  const search = usersRoute.useSearch() as UsersSearch
  const navigate = usersRoute.useNavigate()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Debounce keyword to avoid excessive API calls
  const rawKeyword = resolveKeyword(search.keyword)
  const keywordFilter = useDebounce(rawKeyword, 500)

  const roleFilter = resolveRole(search.role)
  const page = Math.max(1, search.page ?? DEFAULT_PAGE)
  const pageSize = Math.max(1, search.pageSize ?? DEFAULT_PAGE_SIZE)

  const queryInput = useMemo(() => {
    const input: {
      keyword?: string
      role?: UserRole[]
      page: number
      size: number
    } = {
      page,
      size: pageSize,
    }

    if (keywordFilter) {
      input.keyword = keywordFilter
    }

    if (roleFilter) {
      input.role = [roleFilter]
    }

    console.log('🔵 [UsersManagement] queryInput:', input)
    console.log('🔵 [UsersManagement] search.role:', search.role)
    console.log('🔵 [UsersManagement] roleFilter:', roleFilter)

    return input
  }, [keywordFilter, roleFilter, page, pageSize, search.role])

  const usersQuery = useQuery({
    queryKey: [...usersQueryBaseKey, queryInput],
    queryFn: () => fetchUsersList(queryInput),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  })

  const users = usersQuery.data?.users ?? []
  const pagination = usersQuery.data?.pagination ?? {
    page,
    pageSize,
    total: users.length,
    totalPages: users.length > 0 ? 1 : 0,
  }

  const isLoading = usersQuery.isPending
  const isRefetching = usersQuery.isFetching && !usersQuery.isPending

  const handleViewDetail = (id: number) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      setSelectedUser(user)
      setDetailDialogOpen(true)
    }
  }

  const handleDelete = (id: number) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      setSelectedUser(user)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDelete = async () => {
    if (!selectedUser) return

    try {
      console.log('Delete user:', selectedUser.id)
      // TODO: Implement API call
      // await deleteUser(selectedUser.id)
      toast.success('Xóa tài khoản thành công')
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      // Refetch data
      // queryClient.invalidateQueries({ queryKey: usersQueryBaseKey })
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Có lỗi xảy ra khi xóa tài khoản')
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Quản lý tài khoản</h1>
          <p className='text-muted-foreground'>
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Tạo tài khoản mới
        </Button>
      </div>

      <UsersTable
        data={users}
        pageCount={pagination.totalPages}
        isLoading={isLoading}
        isRefetching={isRefetching}
        onViewDetail={handleViewDetail}
        onDelete={handleDelete}
        search={search}
        navigate={navigate}
      />

      <UserDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        user={selectedUser}
      />

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản{' '}
              <strong>{selectedUser?.email}</strong>? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
