/**
 * React Query hooks for Service CRUD operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
    fetchServiceDetail,
    createService,
    updateService,
    deleteService,
    searchServicesForSelection,
    searchParameters,
    fetchServiceParameters,
    addParametersToService,
    deleteParametersFromService,
    type SearchServicesInput,
    type SearchParametersInput,
    type AddParametersRequest,
    type DeleteParametersRequest,
} from '../api/services-crud'
import type { CreateServiceRequest, UpdateServiceRequest } from '../types'

/**
 * Hook to fetch service detail by ID
 */
export const useServiceDetail = (id: number | null, enabled = true) => {
    return useQuery({
        queryKey: ['services', 'detail', id],
        queryFn: () => (id ? fetchServiceDetail(id) : null),
        enabled: enabled && id !== null,
        staleTime: 0,
        gcTime: 0,
    })
}

/**
 * Hook to search services for selection (dùng khi chọn dịch vụ trong gói)
 */
export const useSearchServicesForSelection = (input: SearchServicesInput) => {
    return useQuery({
        queryKey: ['services', 'search', input.keyword],
        queryFn: () => searchServicesForSelection(input),
        enabled: !!input.keyword, // Chỉ query khi có keyword
        staleTime: 0,
        gcTime: 0,
    })
}

/**
 * Hook to search parameters (dùng khi chọn thông số xét nghiệm)
 */
export const useSearchParameters = (input: SearchParametersInput) => {
    return useQuery({
        queryKey: ['parameters', 'search', input.keyword],
        queryFn: () => searchParameters(input),
        enabled: !!input.keyword, // Chỉ query khi có keyword
        staleTime: 0,
        gcTime: 0,
    })
}

/**
 * Hook to fetch service parameters
 */
export const useServiceParameters = (healthPlanId: number | null, enabled = true) => {
    return useQuery({
        queryKey: ['services', 'parameters', healthPlanId],
        queryFn: () => (healthPlanId ? fetchServiceParameters(healthPlanId) : []),
        enabled: enabled && healthPlanId !== null,
        staleTime: 0,
        gcTime: 0,
    })
}

/**
 * Hook to create service
 */
export const useCreateService = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: CreateServiceRequest) => createService(request),
        onSuccess: () => {
            toast.success('Tạo dịch vụ thành công')
            // Invalidate and remove all services queries
            queryClient.invalidateQueries({ queryKey: ['admin-services'] })
            queryClient.removeQueries({ queryKey: ['admin-services'] })
            onSuccessCallback?.()
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể tạo dịch vụ')
        },
    })
}

/**
 * Hook to update service
 */
export const useUpdateService = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: UpdateServiceRequest) => updateService(request),
        onSuccess: (data) => {
            toast.success('Cập nhật dịch vụ thành công')
            // Invalidate and remove all services queries
            queryClient.invalidateQueries({ queryKey: ['admin-services'] })
            queryClient.removeQueries({ queryKey: ['admin-services'] })
            // Invalidate specific service detail if data has id
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: ['services', 'detail', data.id] })
                queryClient.removeQueries({ queryKey: ['services', 'detail', data.id] })
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể cập nhật dịch vụ')
        },
    })
}

/**
 * Hook to delete service
 */
export const useDeleteService = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteService(id),
        onSuccess: () => {
            toast.success('Xóa dịch vụ thành công')
            // Invalidate and remove all services queries
            queryClient.invalidateQueries({ queryKey: ['admin-services'] })
            queryClient.removeQueries({ queryKey: ['admin-services'] })
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể xóa dịch vụ')
        },
    })
}

/**
 * Hook to add parameters to service
 */
export const useAddParametersToService = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: AddParametersRequest) => addParametersToService(request),
        onSuccess: (_, variables) => {
            toast.success('Thêm thông số thành công')
            // Invalidate service parameters
            queryClient.invalidateQueries({
                queryKey: ['services', 'parameters', variables.healthPlanId],
            })
            queryClient.removeQueries({
                queryKey: ['services', 'parameters', variables.healthPlanId],
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể thêm thông số')
        },
    })
}

/**
 * Hook to delete parameters from service
 */
export const useDeleteParametersFromService = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: DeleteParametersRequest) => deleteParametersFromService(request),
        onSuccess: (_, variables) => {
            toast.success('Xóa thông số thành công')
            // Invalidate service parameters
            queryClient.invalidateQueries({
                queryKey: ['services', 'parameters', variables.healthPlanId],
            })
            queryClient.removeQueries({
                queryKey: ['services', 'parameters', variables.healthPlanId],
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể xóa thông số')
        },
    })
}
