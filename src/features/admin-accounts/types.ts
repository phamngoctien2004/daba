/**
 * Admin Account Management Types
 */

import { UserRole, Gender } from '@/types/auth'

export type AccountStatus =
    | 'ACTIVE'        // Đang hoạt động
    | 'INACTIVE'      // Tạm khóa
    | 'LOCKED'        // Bị khóa
    | 'PENDING'       // Chờ kích hoạt

export interface Permission {
    id: number
    code: string
    name: string
    description: string
    module: string
}

export interface RoleDetail {
    id: number
    code: string
    name: string
    description: string
    permissions: Permission[]
    userCount: number
    createdAt: string
    updatedAt: string
}

export interface AccountDetail {
    id: number
    email: string
    role: UserRole
    status: AccountStatus

    // Profile info
    fullName?: string
    phone?: string
    address?: string
    birth?: string
    gender?: Gender
    avatar?: string

    // Doctor specific (if role is BAC_SI)
    doctorId?: number
    departmentId?: number
    departmentName?: string
    licenseNumber?: string

    // Security
    lastLoginAt?: string
    lastLoginIp?: string
    loginAttempts: number
    passwordChangedAt?: string
    twoFactorEnabled: boolean

    // Activity
    totalLogins: number
    totalActions: number

    // System info
    createdAt: string
    updatedAt: string
    createdBy: string
    notes?: string
}

export interface CreateAccountRequest {
    email: string
    password: string
    role: UserRole

    fullName?: string
    phone?: string
    address?: string
    birth?: string
    gender?: Gender

    // If creating doctor account
    doctorId?: number

    notes?: string
}

export interface UpdateAccountRequest {
    email?: string
    role?: UserRole
    status?: AccountStatus

    fullName?: string
    phone?: string
    address?: string
    birth?: string
    gender?: Gender
    avatar?: string

    twoFactorEnabled?: boolean
    notes?: string
}

export interface ChangePasswordRequest {
    userId: number
    newPassword: string
    requirePasswordChange?: boolean
}

export interface ResetPasswordRequest {
    userId: number
    sendEmail: boolean
}

export interface AccountListParams {
    page?: number
    size?: number
    role?: UserRole
    status?: AccountStatus
    departmentId?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface AccountListResponse {
    data: AccountDetail[]
    pagination: {
        page: number
        size: number
        total: number
        totalPages: number
    }
}

export interface AccountActivity {
    id: number
    userId: number
    userName: string
    action: string
    module: string
    description: string
    ipAddress: string
    userAgent: string
    timestamp: string
    status: 'SUCCESS' | 'FAILED'
    errorMessage?: string
}

export interface AccountActivityParams {
    userId?: number
    action?: string
    module?: string
    status?: 'SUCCESS' | 'FAILED'
    startDate?: string
    endDate?: string
    page?: number
    size?: number
}

export interface AccountStatistics {
    totalAccounts: number
    activeAccounts: number
    inactiveAccounts: number
    lockedAccounts: number

    byRole: {
        role: UserRole
        count: number
        percentage: number
    }[]

    recentLogins: {
        userId: number
        userName: string
        email: string
        loginTime: string
    }[]

    recentRegistrations: {
        userId: number
        userName: string
        email: string
        role: UserRole
        registeredAt: string
    }[]

    securityAlerts: {
        type: 'MULTIPLE_FAILED_LOGINS' | 'UNUSUAL_LOCATION' | 'SUSPICIOUS_ACTIVITY'
        userId: number
        userName: string
        description: string
        timestamp: string
    }[]
}

export interface BulkAccountAction {
    userIds: number[]
    action: 'ACTIVATE' | 'DEACTIVATE' | 'LOCK' | 'UNLOCK' | 'DELETE'
    reason?: string
}

export interface CreateRoleRequest {
    code: string
    name: string
    description: string
    permissionIds: number[]
}

export interface UpdateRoleRequest {
    code?: string
    name?: string
    description?: string
    permissionIds?: number[]
}

export interface AssignRoleRequest {
    userId: number
    roleId: number
}
