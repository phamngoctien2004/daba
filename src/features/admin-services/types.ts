export type ServiceType = 'KHAC' | 'DICH_VU' | 'XET_NGHIEM'

export interface Service {
    id: number
    code: string
    name: string
    price: number
    description?: string | null
    roomNumber: string
    roomName: string
    type: ServiceType
}

// Sub-plan (dịch vụ con trong gói)
export interface SubPlan {
    id: number
    code: string
    name: string
    price: number
    description?: string | null
    roomName: string
    type: ServiceType
}

// Parameter (thông số xét nghiệm)
export interface ServiceParameter {
    id: number
    name: string
    unit: string
    range: string
}

// Service detail with sub-plans
export interface ServiceDetail {
    id: number
    code: string
    name: string
    price: number
    type: ServiceType
    subPlans?: SubPlan[]
    description?: string | null
    roomId?: number | null
    roomName?: string | null
    roomNumber?: string | null
}

export interface ServicesResponse {
    data: {
        content: Service[]
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

export interface ServiceListParams {
    keyword?: string
    priceFrom?: number
    priceTo?: number
    type?: ServiceType
    limit?: number
    page?: number
}

export interface ServicesPagination {
    page: number
    total: number
    totalPages: number
    pageSize: number
}

export interface ServicesSearch {
    keyword?: string
    priceRange?: string[]
    type?: string[]
    page?: number
    pageSize?: number
    [key: string]: unknown // Allow additional properties for useTableUrlState
}

// CRUD Request Types
export interface CreateServiceRequest {
    name: string
    type: ServiceType
    price: number
    description?: string
    roomId?: number | null
    detailIds?: number[] // IDs của các dịch vụ con (nếu type = DICH_VU)
    paramIds?: number[] // IDs của các thông số (nếu type = XET_NGHIEM)
}

export interface UpdateServiceRequest {
    id: number
    name: string
    price: number
    description?: string
    roomId?: number | null
}

// API Response Types
export interface ServiceDetailResponse {
    data: ServiceDetail
    message: string
}

export interface CreateServiceResponse {
    data: ServiceDetail
    message: string
}

export interface UpdateServiceResponse {
    data: ServiceDetail
    message: string
}
