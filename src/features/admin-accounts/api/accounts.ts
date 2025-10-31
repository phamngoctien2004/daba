/**
 * Admin Accounts Management API
 */

import { get, post, put, del } from '@/lib/api-client'
import type {
    AccountDetail,
    AccountListParams,
    AccountListResponse,
    CreateAccountRequest,
    UpdateAccountRequest,
    ChangePasswordRequest,
    ResetPasswordRequest,
    AccountActivity,
    AccountActivityParams,
    AccountStatistics,
    BulkAccountAction,
    RoleDetail,
    CreateRoleRequest,
    UpdateRoleRequest,
    Permission,
    AssignRoleRequest,
} from '../types'

/**
 * ===== ACCOUNTS =====
 */

/**
 * Get list of accounts
 */
export async function fetchAccounts(params: AccountListParams): Promise<AccountListResponse> {
    const { data } = await get<AccountListResponse>('/admin/accounts', { params })
    return data
}

/**
 * Get account by ID
 */
export async function getAccountById(id: number): Promise<AccountDetail> {
    const { data } = await get<AccountDetail>(`/admin/accounts/${id}`)
    return data
}

/**
 * Create new account
 */
export async function createAccount(request: CreateAccountRequest): Promise<AccountDetail> {
    const { data } = await post<AccountDetail>('/admin/accounts', request)
    return data
}

/**
 * Update account
 */
export async function updateAccount(
    id: number,
    request: UpdateAccountRequest
): Promise<AccountDetail> {
    const { data } = await put<AccountDetail>(`/admin/accounts/${id}`, request)
    return data
}

/**
 * Delete account
 */
export async function deleteAccount(id: number): Promise<void> {
    await del(`/admin/accounts/${id}`)
}

/**
 * Change account password
 */
export async function changePassword(request: ChangePasswordRequest): Promise<void> {
    await post(`/admin/accounts/${request.userId}/change-password`, request)
}

/**
 * Reset account password
 */
export async function resetPassword(request: ResetPasswordRequest): Promise<void> {
    await post(`/admin/accounts/${request.userId}/reset-password`, request)
}

/**
 * Bulk account action
 */
export async function bulkAccountAction(
    request: BulkAccountAction
): Promise<{ success: boolean; affectedCount: number }> {
    const { data } = await post<{ success: boolean; affectedCount: number }>(
        '/admin/accounts/bulk-action',
        request
    )
    return data
}

/**
 * Get account activity logs
 */
export async function getAccountActivities(
    params: AccountActivityParams
): Promise<{ data: AccountActivity[]; pagination: any }> {
    const { data } = await get<{ data: AccountActivity[]; pagination: any }>(
        '/admin/accounts/activities',
        { params }
    )
    return data
}

/**
 * Get account statistics
 */
export async function getAccountStatistics(): Promise<AccountStatistics> {
    const { data } = await get<AccountStatistics>('/admin/accounts/statistics')
    return data
}

/**
 * ===== ROLES & PERMISSIONS =====
 */

/**
 * Get all roles
 */
export async function fetchRoles(): Promise<RoleDetail[]> {
    const { data } = await get<RoleDetail[]>('/admin/roles')
    return data
}

/**
 * Get role by ID
 */
export async function getRoleById(id: number): Promise<RoleDetail> {
    const { data } = await get<RoleDetail>(`/admin/roles/${id}`)
    return data
}

/**
 * Create new role
 */
export async function createRole(request: CreateRoleRequest): Promise<RoleDetail> {
    const { data } = await post<RoleDetail>('/admin/roles', request)
    return data
}

/**
 * Update role
 */
export async function updateRole(id: number, request: UpdateRoleRequest): Promise<RoleDetail> {
    const { data } = await put<RoleDetail>(`/admin/roles/${id}`, request)
    return data
}

/**
 * Delete role
 */
export async function deleteRole(id: number): Promise<void> {
    await del(`/admin/roles/${id}`)
}

/**
 * Get all permissions
 */
export async function fetchPermissions(): Promise<Permission[]> {
    const { data } = await get<Permission[]>('/admin/permissions')
    return data
}

/**
 * Assign role to user
 */
export async function assignRole(request: AssignRoleRequest): Promise<void> {
    await post(`/admin/accounts/${request.userId}/assign-role`, { roleId: request.roleId })
}
