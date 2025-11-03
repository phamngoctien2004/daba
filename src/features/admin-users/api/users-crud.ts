/**
 * User CRUD API Client
 */

import { get, post, put, del } from '@/lib/api-client'
import type {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    UserResponse,
} from '../types-crud'

/**
 * Get user by ID
 */
export async function fetchUserById(id: number): Promise<User> {
    const response = await get<UserResponse>(`/users/${id}`)
    console.log('🔵 [fetchUserById] Raw response:', response.data)
    // Backend returns {data: {data: User, message: string}}
    // Axios returns response.data which is {data: User, message: string}
    return response.data.data
}

/**
 * Create new user
 */
export async function createUser(request: CreateUserRequest): Promise<User> {
    const response = await post<UserResponse>('/users', request)
    console.log('🔵 [createUser] Raw response:', response.data)
    return response.data.data
}

/**
 * Update user
 */
export async function updateUser(request: UpdateUserRequest): Promise<User> {
    const response = await put<User>('/users', request)
    console.log('🔵 [updateUser] Raw response:', response.data)
    // Backend trả về trực tiếp User object, không có wrapper {data: ...}
    return response.data
}

/**
 * Delete user
 */
export async function deleteUser(id: number): Promise<void> {
    await del(`/users/${id}`)
}

/**
 * Reset user password
 */
export async function resetUserPassword(data: { id: number; password: string }): Promise<void> {
    await post('/users/change-password', {
        id: data.id,
        newPassword: data.password,
    })
    console.log('🔵 [resetUserPassword] Password changed successfully')
}
