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
