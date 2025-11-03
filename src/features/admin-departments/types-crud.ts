/**
 * Department CRUD Types - Simple version matching API docs
 */

export interface Department {
    id: number
    name: string
    phone: string
    description: string
}

export interface CreateDepartmentRequest {
    name: string
    phone: string
    description: string
}

export interface UpdateDepartmentRequest {
    id: number
    name: string
    phone: string
    description: string
}

export interface DepartmentResponse {
    data: Department
    message: string
}
