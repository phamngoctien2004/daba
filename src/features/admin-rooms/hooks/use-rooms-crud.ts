/**
 * Custom hooks for Rooms CRUD operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import {
    createRoom,
    updateRoom,
    deleteRoom,
    fetchRoomDetail,
    type CreateRoomRequest,
    type UpdateRoomRequest,
    type RoomDetail,
} from '../api/rooms'

const ROOMS_QUERY_KEY = ['admin-rooms']

/**
 * Hook to fetch room detail
 */
export function useRoomDetail(roomId: number | null, enabled: boolean = true) {
    return useQuery<RoomDetail | null>({
        queryKey: [...ROOMS_QUERY_KEY, 'detail', roomId],
        queryFn: () => (roomId ? fetchRoomDetail(roomId) : null),
        enabled: enabled && !!roomId,
    })
}

/**
 * Hook to create room
 */
export function useCreateRoom(onSuccess?: () => void) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (payload: CreateRoomRequest) => createRoom(payload),
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: 'Đã thêm phòng mới',
            })
            queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY })
            onSuccess?.()
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể thêm phòng',
            })
        },
    })
}

/**
 * Hook to update room
 */
export function useUpdateRoom(onSuccess?: () => void) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (payload: UpdateRoomRequest) => updateRoom(payload),
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: 'Đã cập nhật phòng',
            })
            queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY })
            onSuccess?.()
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể cập nhật phòng',
            })
        },
    })
}

/**
 * Hook to delete room
 */
export function useDeleteRoom() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (roomId: number) => deleteRoom(roomId),
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: 'Đã xóa phòng',
            })
            queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY })
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể xóa phòng',
            })
        },
    })
}
