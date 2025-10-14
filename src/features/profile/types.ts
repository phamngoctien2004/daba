export type UserRole = 'ADMIN' | 'LE_TAN' | 'BAC_SI' | 'BENH_NHAN'
export type Gender = 'NAM' | 'NU' | 'KHAC'

export interface Doctor {
  id: number
  fullName: string
  phone: string
  address: string
  birth: string
  gender: Gender
  profileImage: string | null
  exp: number
  position: string
  available: boolean
}

export interface User {
  id: number
  email: string
  phone?: string
  name: string
  role: UserRole
  status: boolean
  createdAt: string
  doctor?: Doctor
}

export interface UserMeResponse {
  data: User
  message: string
}
