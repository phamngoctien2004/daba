import { AxiosError } from 'axios'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'

/**
 * Shared QueryClient instance for the application
 * Can be imported and used anywhere in the app
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                // eslint-disable-next-line no-console
                if (import.meta.env.DEV) console.log({ failureCount, error })

                if (failureCount >= 0 && import.meta.env.DEV) return false
                if (failureCount > 3 && import.meta.env.PROD) return false

                return !(
                    error instanceof AxiosError &&
                    [401, 403].includes(error.response?.status ?? 0)
                )
            },
            refetchOnWindowFocus: import.meta.env.PROD,
            staleTime: 10 * 1000, // 10s
        },
        mutations: {
            onError: (error) => {
                handleServerError(error)

                if (error instanceof AxiosError) {
                    if (error.response?.status === 304) {
                        toast.error('Content not modified!')
                    }
                }
            },
        },
    },
    queryCache: new QueryCache({
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    toast.error('Session expired!')
                    // Note: Actual redirect logic should be handled in the component/store
                    // to avoid circular dependency with router
                }
                if (error.response?.status === 500) {
                    toast.error('Internal Server Error!')
                }
                if (error.response?.status === 403) {
                    // router.navigate("/forbidden", { replace: true });
                }
            }
        },
    }),
})
