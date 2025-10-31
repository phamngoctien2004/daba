/**
 * Types for Rooms Management
 */

export interface RoomsSearch extends Record<string, unknown> {
    keyword?: string
    departmentId?: string | string[]
    page?: number
    pageSize?: number
}
