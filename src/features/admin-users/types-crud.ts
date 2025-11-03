/**
 * User CRUD Types
 */

export type UserRole = 'BAC_SI' | 'BENH_NHAN' | 'LE_TAN' | 'ADMIN'

export interface User {
    id: number
    email: string
    phone: string
    name: string
    role: UserRole
    status: boolean
    createdAt: string
}

export interface CreateUserRequest {
    email: string
    password: string
    phone: string
    role: UserRole
    name: string
}

export interface UpdateUserRequest {
    id: number
    email: string
    password?: string // Optional for update
    phone: string
    role: UserRole
    name: string
}

export interface UserResponse {
    data: User
    message: string
}
