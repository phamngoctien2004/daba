import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    fetchMedicalRecordDetail,
    updateMedicalRecord,
    updateMedicalRecordStatus,
    payCash,
    type UpdateMedicalRecordPayload,
    type UpdateMedicalRecordStatusPayload,
    type PayCashPayload,
} from '../api/medical-records'

/**
 * Hook to fetch medical record detail
 */
export const useMedicalRecordDetail = (id: string) => {
    return useQuery({
        queryKey: ['medical-record', id],
        queryFn: () => fetchMedicalRecordDetail(id),
        enabled: !!id,
    })
}

/**
 * Hook to update medical record (clinical examination, diagnosis, etc.)
 */
export const useUpdateMedicalRecord = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: UpdateMedicalRecordPayload) => updateMedicalRecord(payload),
        onSuccess: (data, variables) => {
            toast.success(data.message)
            // Invalidate the medical record detail query to refetch
            queryClient.invalidateQueries({ queryKey: ['medical-record', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['medical-records'] })
        },
        onError: (error: Error) => {
            toast.error('Lỗi cập nhật phiếu khám', {
                description: error.message,
            })
        },
    })
}

/**
 * Hook to update medical record status
 */
export const useUpdateMedicalRecordStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: UpdateMedicalRecordStatusPayload) => updateMedicalRecordStatus(payload),
        onSuccess: (data, variables) => {
            toast.success(data.message)
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['medical-record', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['medical-records'] })
        },
        onError: (error: Error) => {
            toast.error('Lỗi cập nhật trạng thái', {
                description: error.message,
            })
        },
    })
}

/**
 * Hook to pay cash for medical record
 */
export const usePayCash = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: PayCashPayload) => payCash(payload),
        onSuccess: (data) => {
            toast.success(data.message)
            // Invalidate queries to refetch updated payment status
            queryClient.invalidateQueries({ queryKey: ['medical-record'] })
            queryClient.invalidateQueries({ queryKey: ['medical-records'] })
        },
        onError: (error: Error) => {
            toast.error('Lỗi thanh toán', {
                description: error.message,
            })
        },
    })
}
