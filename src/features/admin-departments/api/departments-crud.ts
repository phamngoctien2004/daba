/**
 * Department CRUD API Client
 */

import { get, post, put, del } from '@/lib/api-client'
import type {
    Department,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    DepartmentResponse,
} from '../types-crud'

/**
 * Get department by ID
 */
export async function fetchDepartmentById(id: number): Promise<Department> {
    const response = await get<DepartmentResponse>(`/departments/${id}`)
    return response.data.data
}

/**
 * Create new department
 */
export async function createDepartment(
    request: CreateDepartmentRequest
): Promise<Department> {
    const response = await post<DepartmentResponse>('/departments', request)
    return response.data.data
}

/**
 * Update department
 */
export async function updateDepartment(
    request: UpdateDepartmentRequest
): Promise<Department> {
    const response = await put<DepartmentResponse>('/departments', request)
    return response.data.data
}

/**
 * Delete department
 */
export async function deleteDepartment(id: number): Promise<void> {
    await del(`/departments/${id}`)
}
