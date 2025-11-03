/**
 * User CRUD Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
} from '../api/users-crud'

/**
 * Query keys
 */
export const userKeys = {
    all: ['admin', 'users'] as const, // Khớp với query key trong users-management.tsx
    detail: (id: number) => ['users', 'detail', id] as const,
}

/**
 * Get user by ID
 */
export function useUserDetail(id: number | null, enabled: boolean = true) {
    return useQuery({
        queryKey: userKeys.detail(id!),
        queryFn: () => fetchUserById(id!),
        enabled: !!id && enabled,
        staleTime: 0,
    })
}

/**
 * Create user
 */
export function useCreateUser(onSuccessCallback?: () => void) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            toast.success('Thêm người dùng thành công')
            queryClient.invalidateQueries({ queryKey: userKeys.all })
            queryClient.removeQueries({ queryKey: userKeys.all })
            onSuccessCallback?.()
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Thêm người dùng thất bại')
        },
    })
}

/**
 * Update user
 */
export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateUser,
        onSuccess: (data) => {
            toast.success('Cập nhật người dùng thành công')
            queryClient.invalidateQueries({ queryKey: userKeys.all })
            queryClient.removeQueries({ queryKey: userKeys.all })
            // Invalidate detail query nếu có id
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) })
            }
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Cập nhật người dùng thất bại')
        },
    })
}

/**
 * Delete user
 */
export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            toast.success('Xóa người dùng thành công')
            queryClient.invalidateQueries({ queryKey: userKeys.all })
            queryClient.removeQueries({ queryKey: userKeys.all })
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Xóa người dùng thất bại')
        },
    })
}

/**
 * Reset user password
 */
export function useResetUserPassword() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: resetUserPassword,
        onSuccess: () => {
            toast.success('Đặt lại mật khẩu thành công')
            queryClient.invalidateQueries({ queryKey: userKeys.all })
            queryClient.removeQueries({ queryKey: userKeys.all })
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Đặt lại mật khẩu thất bại')
        },
    })
}
