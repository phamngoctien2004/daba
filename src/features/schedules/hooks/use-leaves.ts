import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    fetchMyLeaves,
    createLeaveRequest,
    deleteLeaveRequest,
    fetchAvailableSchedules,
    type FetchAvailableSchedulesParams,
} from '../api/schedules'
import type { FetchMyLeavesParams, CreateLeaveRequest } from '../types'

/**
 * Hook to fetch available schedules
 */
export const useAvailableSchedules = (params: FetchAvailableSchedulesParams) => {
    return useQuery({
        queryKey: ['available-schedules', params],
        queryFn: () => fetchAvailableSchedules(params),
        enabled: !!params.startDate && !!params.endDate,
    })
}

/**
 * Hook to fetch my leave requests
 */
export const useMyLeaves = (params?: FetchMyLeavesParams) => {
    return useQuery({
        queryKey: ['my-leaves', params],
        queryFn: () => fetchMyLeaves(params),
    })
}

/**
 * Hook to create leave request
 */
export const useCreateLeave = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateLeaveRequest) => createLeaveRequest(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-leaves'] })
            toast.success('Tạo đơn nghỉ phép thành công')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể tạo đơn nghỉ phép')
        },
    })
}

/**
 * Hook to delete/cancel leave request
 */
export const useDeleteLeave = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteLeaveRequest({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-leaves'] })
            toast.success('Hủy đơn nghỉ phép thành công')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể hủy đơn nghỉ phép')
        },
    })
}
