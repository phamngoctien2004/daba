import { useEffect, useState } from 'react'

/**
 * Hook to delay showing loading state
 * Only shows loading if the operation takes longer than the specified delay
 * 
 * @param isLoading - The actual loading state from query/mutation
 * @param delay - Delay in milliseconds before showing loading (default: 1000ms)
 * @returns Delayed loading state
 */
export function useDelayedLoading(isLoading: boolean, delay: number = 1000): boolean {
    const [showLoading, setShowLoading] = useState(false)

    useEffect(() => {
        if (!isLoading) {
            setShowLoading(false)
            return
        }

        // Set a timeout to show loading after delay
        const timeout = setTimeout(() => {
            setShowLoading(true)
        }, delay)

        // Cleanup timeout if loading finishes before delay
        return () => clearTimeout(timeout)
    }, [isLoading, delay])

    return showLoading
}
