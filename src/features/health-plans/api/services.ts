import { get } from '@/lib/api-client'

export type HealthPlanType = 'DICH_VU' | 'XET_NGHIEM' | 'CHUYEN_KHOA' | string

export interface HealthPlan {
  id: number
  code?: string
  name: string
  price: number // API returns 'price'
  type?: HealthPlanType
  description?: string
  duration?: number
  roomNumber?: string
  roomName?: string
  // Keep fee for backward compatibility
  fee?: number
}

const isHealthPlan = (value: unknown): value is HealthPlan => {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number'
  )
}

/**
 * Fetch all health plans (services)
 * GET /api/services
 * Response: Array of services (not wrapped in {data: ...})
 */
export const fetchHealthPlans = async (): Promise<HealthPlan[]> => {
  console.log('🟢 [fetchHealthPlans] Calling API: GET /services')

  const { data } = await get<HealthPlan[]>('/services')

  console.log('🟢 [fetchHealthPlans] Raw response:', data)
  console.log('🟢 [fetchHealthPlans] Is array?', Array.isArray(data))

  if (Array.isArray(data)) {
    const plans = data.filter(isHealthPlan)
    console.log('🟢 [fetchHealthPlans] Filtered plans:', plans.length, 'from', data.length)

    // Normalize price to fee for backward compatibility
    const normalized = plans.map(plan => ({
      ...plan,
      fee: plan.price || 0
    }))

    console.log('✅ [fetchHealthPlans] Returning health plans:', normalized.length)
    return normalized
  }

  console.warn('⚠️ [fetchHealthPlans] Returning empty array - response is not an array')
  return []
}
