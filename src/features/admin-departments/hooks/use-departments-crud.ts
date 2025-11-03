/**
 * Department CRUD Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    fetchDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from '../api/departments-crud'

/**
 * Query keys
 */
export const departmentKeys = {
    all: ['admin-departments-list'] as const, // Khớp với query key trong index.tsx
    detail: (id: number) => ['departments', 'detail', id] as const,
}

/**
 * Get department by ID
 */
export function useDepartmentDetail(id: number | null, enabled: boolean = true) {
    return useQuery({
        queryKey: departmentKeys.detail(id!),
        queryFn: () => fetchDepartmentById(id!),
        enabled: !!id && enabled,
        staleTime: 0,
    })
}

/**
 * Create department
 */
export function useCreateDepartment(onSuccessCallback?: () => void) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createDepartment,
        onSuccess: () => {
            toast.success('Thêm khoa thành công')
            // Invalidate all department queries
            queryClient.invalidateQueries({ queryKey: departmentKeys.all })
            queryClient.removeQueries({ queryKey: departmentKeys.all })
            onSuccessCallback?.()
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Thêm khoa thất bại')
        },
    })
}

/**
 * Update department
 */
export function useUpdateDepartment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateDepartment,
        onSuccess: (data) => {
            toast.success('Cập nhật khoa thành công')
            // Invalidate all department queries
            queryClient.invalidateQueries({ queryKey: departmentKeys.all })
            queryClient.removeQueries({ queryKey: departmentKeys.all })
            queryClient.invalidateQueries({ queryKey: departmentKeys.detail(data.id) })
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Cập nhật khoa thất bại')
        },
    })
}

/**
 * Delete department
 */
export function useDeleteDepartment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => {
            toast.success('Xóa khoa thành công')
            // Invalidate all department queries
            queryClient.invalidateQueries({ queryKey: departmentKeys.all })
            queryClient.removeQueries({ queryKey: departmentKeys.all })
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Xóa khoa thất bại')
        },
    })
}
