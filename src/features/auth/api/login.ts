import { post } from '@/lib/api-client'
import { type UserRole } from '@/types/auth'

export interface LoginPayload {
    email: string
    password: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken?: string
    user: {
        accountNo: string
        email: string
        roles: UserRole[]
    }
}

export const login = async (payload: LoginPayload) => {
    const response = await post<LoginResponse>('/auth/dashboard/login', payload)
    return response.data
}
