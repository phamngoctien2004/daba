export type Gender = 'NAM' | 'NU' | 'KHAC'
export type BloodType = 'A' | 'B' | 'AB' | 'O' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export interface Patient {
  id: number
  code: string
  bloodType: string | null
  weight: number | null
  height: number | null
  registrationDate: string
  fullName: string
  phone: string | null
  address: string | null
  cccd: string | null
  birth: string | null
  gender: Gender
  profileImage: string | null
  relationship: string | null
  email: string | null
  verified: boolean
}

export interface PatientsResponse {
  data: {
    content: Patient[]
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

export interface PatientListParams {
  keyword?: string
  limit?: number
  page?: number
}

export interface PatientsPagination {
  page: number
  total: number
  totalPages: number
  pageSize: number
}

export interface PatientsSearch {
  keyword?: string
  page?: number
  pageSize?: number
  [key: string]: unknown // Allow additional properties for useTableUrlState
}
