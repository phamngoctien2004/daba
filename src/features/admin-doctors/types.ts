/**
 * Admin Doctor Management Types
 */

export type DoctorStatus =
    | 'ACTIVE'        // Đang hoạt động
    | 'INACTIVE'      // Tạm nghỉ
    | 'LEAVE'         // Nghỉ phép
    | 'TERMINATED'    // Đã nghỉ việc

// Degree Response
export interface DegreeResponse {
    degreeId: number
    degreeName: string
    examinationFee: number
}

// Department Response
export interface DepartmentResponse {
    id: number
    name: string
}

// Doctor Detail from API
export interface DoctorDetail {
    id: number
    fullName: string
    degreeResponse: DegreeResponse
    position: string
    departmentResponse: DepartmentResponse
    examinationFee: number
    available: boolean
    roomNumber: string
    roomName: string
}

// Filters
export interface DoctorFilters {
    departmentId?: number
    degreeId?: number
    keyword?: string
}

// List params
export interface DoctorListParams {
    page?: number
    size?: number
    sort?: string
    filters?: DoctorFilters
}

// API Response
export interface DoctorsResponse {
    data: {
        content: DoctorDetail[]
        pageable: {
            pageNumber: number
            pageSize: number
            sort: {
                sorted: boolean
                unsorted: boolean
                empty: boolean
            }
            offset: number
            paged: boolean
            unpaged: boolean
        }
        totalPages: number
        totalElements: number
        last: boolean
        first: boolean
        size: number
        number: number
        sort: {
            sorted: boolean
            unsorted: boolean
            empty: boolean
        }
        numberOfElements: number
        empty: boolean
    }
    message: string
}