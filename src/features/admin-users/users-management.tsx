import { useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { UsersTable } from './components/users-table'
import { UserDetailDialog } from './components/user-detail-dialog'
import { CreateUserDialog } from './components/create-user-dialog'
import { EditUserDialog } from './components/edit-user-dialog'
import { DeleteUserDialog } from './components/delete-user-dialog'
import { ResetPasswordDialog } from './components/reset-password-dialog'
import { fetchUsersList } from './api/users'
import type { UsersSearch, UserRole } from './types'

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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUserName, setSelectedUserName] = useState<string>('')

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
    staleTime: 0, // Không cache - luôn fetch mới
    gcTime: 0, // Không giữ cache trong bộ nhớ
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
      setSelectedUserId(id)
      setSelectedUserName(user.name)
      setDetailDialogOpen(true)
    }
  }

  const handleEdit = (id: number) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      setSelectedUserId(id)
      setSelectedUserName(user.name)
      setEditDialogOpen(true)
    }
  }

  const handleDelete = (id: number) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      setSelectedUserId(id)
      setSelectedUserName(user.name)
      setDeleteDialogOpen(true)
    }
  }

  const handleResetPassword = (id: number) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      setSelectedUserId(id)
      setSelectedUserName(user.name || user.email)
      setResetPasswordDialogOpen(true)
    }
  }

  const handleCreateSuccess = () => {
    // Reset to first page after creating
    navigate({ search: { ...search, page: DEFAULT_PAGE } })
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
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
        search={search}
        navigate={navigate}
      />

      <UserDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        userId={selectedUserId}
      />

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        userId={selectedUserId}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        userId={selectedUserId}
        userName={selectedUserName}
      />

      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        userId={selectedUserId}
        userName={selectedUserName}
      />
    </div>
  )
}
