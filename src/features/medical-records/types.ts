export type MedicalRecordStatus = 'CHO_KHAM' | 'DANG_KHAM' | 'CHO_XET_NGHIEM' | 'HOAN_THANH' | 'HUY'
export type InvoiceDetailStatus = 'DA_THANH_TOAN' | 'THANH_TOAN_MOT_PHAN' | 'CHUA_THANH_TOAN'
export type LabOrderStatus = 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY'

export interface LabOrderItem {
    id: number
    code: string
    name: string
    doctorPerforming: string | null
    room: string
    createdAt: string
    status: LabOrderStatus
}

export interface InvoiceDetail {
    id: number
    healthPlanId: number
    healthPlanName: string
    healthPlanPrice: number
    paid: number
    description: string
    status: InvoiceDetailStatus
    multipleLab: LabOrderItem[] | null
    singleLab: LabOrderItem | null
    typeService: 'MULTIPLE' | 'SINGLE'
}

export interface MedicalRecord {
    id: string
    code: string
    symptoms: string | null
    clinicalExamination: string | null
    diagnosis: string | null
    treatmentPlan: string | null
    note: string | null
    patientId: number
    patientName: string
    patientPhone: string | null
    patientAddress: string | null
    patientGender: string | null
    date: string
    status: MedicalRecordStatus
    healthPlanId: number | null
    healthPlanName: string | null
    total: number
    paid: number | null
    invoiceDetailsResponse: InvoiceDetail[] | null
}

export interface MedicalRecordDetail extends MedicalRecord {
    // Detail page có đầy đủ thông tin
}

export interface MedicalRecordsResponse {
    data: {
        content: MedicalRecord[]
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

export interface MedicalRecordListParams {
    keyword?: string
    date?: string
    status?: MedicalRecordStatus
    limit?: number
    page?: number
}

export interface MedicalRecordsPagination {
    page: number
    total: number
    totalPages: number
    limit: number
}

export interface MedicalRecordsSearch {
    keyword?: string
    date?: string
    status?: MedicalRecordStatus[]
    page?: number
    pageSize?: number
    [key: string]: unknown // Allow additional properties for useTableUrlState
}
