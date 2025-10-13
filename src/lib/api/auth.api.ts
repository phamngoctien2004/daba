import apiClient from '@/lib/api-client'
import { type LoginRequest, type LoginResponse } from '@/types/auth'

/**
 * Login to the dashboard
 * @param credentials - Username and password
 * @returns Login response with access token and user data
 */
export const login = async (
    credentials: LoginRequest
): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
        '/auth/dashboard/login',
        credentials
    )
    return response.data
}

/**
 * Logout from the dashboard
 */
export const logout = async (): Promise<void> => {
    // If you have a logout endpoint, call it here
    // await apiClient.post('/auth/logout')
}
