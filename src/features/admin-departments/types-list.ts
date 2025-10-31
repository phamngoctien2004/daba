/**
 * Types for Departments List Management
 */

export interface DepartmentsSearch extends Record<string, unknown> {
    keyword?: string
    page?: number
    pageSize?: number
}
