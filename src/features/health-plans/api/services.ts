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

/**
 * Sub-plan for service package
 */
export interface ServiceSubPlan {
  id: number
  code: string
  name: string
  price: number
  roomName: string
}

/**
 * Service detail - Package type (with sub-plans)
 */
export interface ServicePackageDetail {
  id: number
  code: string
  name: string
  price: number
  type: 'DICH_VU'
  subPlans: ServiceSubPlan[]
}

/**
 * Service detail - Single service type
 */
export interface ServiceSingleDetail {
  id: number
  code: string
  name: string
  price: number
  roomName: string
  type: HealthPlanType
}

/**
 * Union type for service detail
 */
export type ServiceDetail = ServicePackageDetail | ServiceSingleDetail

/**
 * Type guard for service package
 */
export function isServicePackage(service: ServiceDetail): service is ServicePackageDetail {
  return 'subPlans' in service && Array.isArray(service.subPlans)
}

/**
 * Type guard for single service
 */
export function isServiceSingle(service: ServiceDetail): service is ServiceSingleDetail {
  return 'roomName' in service && typeof service.roomName === 'string'
}

/**
 * Fetch service detail by ID
 * GET /api/services/optional/{id}
 * Returns either package with subPlans or single service with roomName
 */
export const fetchServiceDetail = async (id: number): Promise<ServiceDetail | null> => {
  console.log('🟢 [fetchServiceDetail] Calling API: GET /services/optional/' + id)

  try {
    const { data } = await get<{ data: ServiceDetail; message: string }>(
      `/services/optional/${id}`
    )

    console.log('🟢 [fetchServiceDetail] Raw response:', data)

    if (data?.data) {
      console.log('✅ [fetchServiceDetail] Service detail:', data.data)
      return data.data
    }

    console.warn('⚠️ [fetchServiceDetail] No data in response')
    return null
  } catch (error) {
    console.error('❌ [fetchServiceDetail] Error:', error)
    return null
  }
}
