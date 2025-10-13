/**
 * Local storage key for auth token
 */
const AUTH_TOKEN_KEY = 'auth_token'

/**
 * Local storage key for user data
 */
const USER_DATA_KEY = 'user_data'

const logStorageError = (message: string, error: unknown) => {
    if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error(message, error)
    }
}

/**
 * Get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
    try {
        return localStorage.getItem(AUTH_TOKEN_KEY)
    } catch (error) {
        logStorageError('Error getting auth token:', error)
        return null
    }
}

/**
 * Set auth token in localStorage
 */
export const setAuthToken = (token: string): void => {
    try {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
    } catch (error) {
        logStorageError('Error setting auth token:', error)
    }
}

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = (): void => {
    try {
        localStorage.removeItem(AUTH_TOKEN_KEY)
    } catch (error) {
        logStorageError('Error removing auth token:', error)
    }
}

/**
 * Get user data from localStorage
 */
export const getUserData = <T = unknown>(): T | null => {
    try {
        const data = localStorage.getItem(USER_DATA_KEY)
        return data ? JSON.parse(data) : null
    } catch (error) {
        logStorageError('Error getting user data:', error)
        return null
    }
}

/**
 * Set user data in localStorage
 */
export const setUserData = <T = unknown>(data: T): void => {
    try {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data))
    } catch (error) {
        logStorageError('Error setting user data:', error)
    }
}

/**
 * Remove user data from localStorage
 */
export const removeUserData = (): void => {
    try {
        localStorage.removeItem(USER_DATA_KEY)
    } catch (error) {
        logStorageError('Error removing user data:', error)
    }
}

/**
 * Clear all auth-related data from localStorage
 */
export const clearAuthData = (): void => {
    removeAuthToken()
    removeUserData()
}
