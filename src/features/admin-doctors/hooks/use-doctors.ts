/**
 * Admin Doctors React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchDoctors, createDoctor, updateDoctor, deleteDoctor } from '../api/doctors'
import type { DoctorListParams } from '../types'

/**
 * Query keys for doctors
 */
export const doctorsKeys = {
  all: ['admin-doctors'] as const,
  lists: () => [...doctorsKeys.all, 'list'] as const,
  list: (params: DoctorListParams) => [...doctorsKeys.lists(), params] as const,
}

/**
 * Hook to fetch doctors list
 */
export function useDoctors(params: DoctorListParams) {
  return useQuery({
    queryKey: doctorsKeys.list(params),
    queryFn: () => fetchDoctors(params),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  })
}

/**
 * Hook to create a new doctor
 */
export function useCreateDoctor(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      toast.success('Thêm bác sĩ thành công')
      // Invalidate all doctor queries to refetch
      queryClient.invalidateQueries({ queryKey: doctorsKeys.all })
      // Clear all caches
      queryClient.removeQueries({ queryKey: doctorsKeys.all })
      // Call custom callback (e.g., reset to page 0)
      onSuccessCallback?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi thêm bác sĩ')
    },
  })
}

/**
 * Hook to update an existing doctor
 */
export function useUpdateDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDoctor,
    onSuccess: (data) => {
      toast.success('Cập nhật bác sĩ thành công')
      // Invalidate to refetch current page
      queryClient.invalidateQueries({ queryKey: doctorsKeys.all })
      queryClient.removeQueries({ queryKey: doctorsKeys.all })
      // Also invalidate doctor detail queries
      queryClient.invalidateQueries({ queryKey: ['doctor-detail', data.id] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật bác sĩ')
    },
  })
}

/**
 * Hook to delete a doctor
 */
export function useDeleteDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      toast.success('Xóa bác sĩ thành công')
      // Invalidate to refetch current page
      queryClient.invalidateQueries({ queryKey: doctorsKeys.all })
      queryClient.removeQueries({ queryKey: doctorsKeys.all })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa bác sĩ')
    },
  })
}
