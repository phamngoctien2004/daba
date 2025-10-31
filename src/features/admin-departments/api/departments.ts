/**
 * Admin Departments & Rooms Management API
 */

import { get, post, put, del } from '@/lib/api-client'
import type {
    DepartmentDetail,
    DepartmentListParams,
    DepartmentListResponse,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    Room,
    RoomListParams,
    RoomListResponse,
    CreateRoomRequest,
    UpdateRoomRequest,
    DepartmentStatistics,
    RoomSchedule,
} from '../types'

/**
 * ===== DEPARTMENTS =====
 */

/**
 * Get list of departments
 */
export async function fetchDepartments(
    params: DepartmentListParams
): Promise<DepartmentListResponse> {
    const { data } = await get<DepartmentListResponse>('/admin/departments', { params })
    return data
}

/**
 * Get department by ID
 */
export async function getDepartmentById(id: number): Promise<DepartmentDetail> {
    const { data } = await get<DepartmentDetail>(`/admin/departments/${id}`)
    return data
}

/**
 * Create new department
 */
export async function createDepartment(
    request: CreateDepartmentRequest
): Promise<DepartmentDetail> {
    const { data } = await post<DepartmentDetail>('/admin/departments', request)
    return data
}

/**
 * Update department
 */
export async function updateDepartment(
    id: number,
    request: UpdateDepartmentRequest
): Promise<DepartmentDetail> {
    const { data } = await put<DepartmentDetail>(`/admin/departments/${id}`, request)
    return data
}

/**
 * Delete department
 */
export async function deleteDepartment(id: number): Promise<void> {
    await del(`/admin/departments/${id}`)
}

/**
 * Get department statistics
 */
export async function getDepartmentStatistics(params: {
    departmentId: number
    startDate: string
    endDate: string
}): Promise<DepartmentStatistics> {
    const { data } = await get<DepartmentStatistics>(
        `/admin/departments/${params.departmentId}/statistics`,
        { params }
    )
    return data
}

/**
 * ===== ROOMS =====
 */

/**
 * Get list of rooms
 */
export async function fetchRooms(params: RoomListParams): Promise<RoomListResponse> {
    const { data } = await get<RoomListResponse>('/admin/rooms', { params })
    return data
}

/**
 * Get room by ID
 */
export async function getRoomById(id: number): Promise<Room> {
    const { data } = await get<Room>(`/admin/rooms/${id}`)
    return data
}

/**
 * Create new room
 */
export async function createRoom(request: CreateRoomRequest): Promise<Room> {
    const { data } = await post<Room>('/admin/rooms', request)
    return data
}

/**
 * Update room
 */
export async function updateRoom(id: number, request: UpdateRoomRequest): Promise<Room> {
    const { data } = await put<Room>(`/admin/rooms/${id}`, request)
    return data
}

/**
 * Delete room
 */
export async function deleteRoom(id: number): Promise<void> {
    await del(`/admin/rooms/${id}`)
}

/**
 * Get room schedule
 */
export async function getRoomSchedule(params: {
    roomId: number
    date: string
}): Promise<RoomSchedule> {
    const { data } = await get<RoomSchedule>(`/admin/rooms/${params.roomId}/schedule`, { params })
    return data
}

/**
 * Toggle room status
 */
export async function toggleRoomStatus(id: number): Promise<Room> {
    const { data } = await post<Room>(`/admin/rooms/${id}/toggle-status`)
    return data
}
