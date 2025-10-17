export type LabOrderStatus = 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'CHO_KET_QUA' | 'HOAN_THANH' | 'HUY_BO'

export interface LabOrder {
  id: number
  code: string
  recordId: number
  healthPlanId: number
  healthPlanName: string
  room: string
  doctorPerformed: string | null
  doctorPerformedId: number | null
  doctorOrdered: string | null
  status: LabOrderStatus
  statusPayment: string | null
  price: number
  orderDate: string
  diagnosis: string | null
  expectedResultDate: string | null
  serviceParent: string | null
  labResultResponse: LabResult | null
}

export interface ParamResult {
  id: number
  name: string
  value: string | null
  unit: string
  range: string
  rangeStatus: 'CAO' | 'THAP' | 'TRUNG_BINH' | 'CHUA_XAC_DINH'
}

export interface LabResult {
  id: number
  date: string
  status: string
  resultDetails: string | null
  note: string | null
  explanation: string | null
  isDone?: boolean
  paramResults?: ParamResult[]
}

export interface LabOrdersPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface LabOrdersSearch {
  keyword?: string
  date?: string
  status?: LabOrderStatus[]
  page?: number
  pageSize?: number
  [key: string]: unknown
}

export interface LabParam {
  id: number
  name: string
  unit: string
  range: string
}

export interface LabResultDetailParam {
  paramId: number
  value: string
}

export interface CreateLabResultDetailsPayload {
  labResultId: number
  paramDetails: LabResultDetailParam[]
}

export interface LabResultDetail {
  id: number
  name: string
  value: string
  unit: string
  range: string
  rangeStatus: 'CAO' | 'THAP' | 'TRUNG_BINH'
}
