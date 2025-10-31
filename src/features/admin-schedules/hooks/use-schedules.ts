/**
 * Admin Doctor Schedules Hooks
 */

import { useQuery } from '@tanstack/react-query'
import {
    fetchAvailableSchedules,
    fetchDepartments,
    fetchDoctorsByDepartment,
    fetchAllDoctors,
} from '../api/schedules'
import type { ScheduleFilters } from '../types'

// ==================== Query Keys ====================

export const scheduleKeys = {
    all: ['admin-schedules'] as const,
    schedules: (filters: ScheduleFilters) => [...scheduleKeys.all, 'list', filters] as const,
    departments: () => [...scheduleKeys.all, 'departments'] as const,
    doctors: (departmentId?: number) => [...scheduleKeys.all, 'doctors', departmentId] as const,
}

// ==================== Schedules Hooks ====================

/**
 * Hook to fetch available schedules
 * Only fetch when there is at least one filter (departmentId or doctorId) to avoid timeout
 */
export function useAvailableSchedules(filters: ScheduleFilters) {
    const hasFilter = !!filters.departmentId || !!filters.doctorId

    return useQuery({
        queryKey: scheduleKeys.schedules(filters),
        queryFn: () => fetchAvailableSchedules(filters),
        enabled: !!filters.startDate && !!filters.endDate && hasFilter, // Only fetch when there's a filter
        staleTime: 30_000, // 30 seconds
    })
}

// ==================== Departments Hooks ====================

/**
 * Hook to fetch all departments
 */
export function useDepartments() {
    return useQuery({
        queryKey: scheduleKeys.departments(),
        queryFn: fetchDepartments,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ==================== Doctors Hooks ====================

/**
 * Hook to fetch doctors by department
 */
export function useDoctorsByDepartment(departmentId?: number) {
    return useQuery({
        queryKey: scheduleKeys.doctors(departmentId),
        queryFn: () =>
            departmentId
                ? fetchDoctorsByDepartment(departmentId)
                : Promise.resolve([]),
        enabled: !!departmentId, // Only fetch when departmentId is truthy (not null, undefined, or 0)
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch all doctors
 */
export function useAllDoctors() {
    return useQuery({
        queryKey: scheduleKeys.doctors(undefined),
        queryFn: fetchAllDoctors,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
