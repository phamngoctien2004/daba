/**
 * User Roles in the system
 */
export enum UserRole {
    ADMIN = 'ADMIN',
    LE_TAN = 'LE_TAN', // Receptionist
    BAC_SI = 'BAC_SI', // Doctor
}

/**
 * Gender types
 */
export enum Gender {
    NAM = 'NAM', // Male
    NU = 'NU', // Female
}

/**
 * Doctor information
 */
export interface Doctor {
    id: number
    fullName: string
    phone: string
    address: string
    birth: string
    gender: Gender
    profileImage: string
    exp: number // Years of experience
    position: string
    available: boolean
}

/**
 * User information from API response
 */
export interface User {
    id: number
    email: string
    role: UserRole
    status: boolean
    createdAt: string
    doctor?: Doctor
}

/**
 * Login request payload
 */
export interface LoginRequest {
    username: string
    password: string
}

/**
 * Login response from API
 */
export interface LoginResponse {
    data: {
        accessToken: string
        userResponse: User
    }
    message: string
}

/**
 * Auth state in store
 */
export interface AuthState {
    user: User | null
    accessToken: string
    isAuthenticated: boolean
}
