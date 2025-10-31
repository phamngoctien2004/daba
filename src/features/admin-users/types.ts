/**
 * Types for Users Management
 */

export type UserRole = 'BAC_SI' | 'BENH_NHAN' | 'LE_TAN' | 'ADMIN'

export interface UsersSearch extends Record<string, unknown> {
    keyword?: string
    role?: string
    page?: number
    pageSize?: number
}
