/**
 * LocalStorage keys
 */
const APPOINTMENT_DATA_KEY = 'appointment_for_medical_record'

/**
 * Appointment data structure for medical record creation
 */
export interface AppointmentDataForMedicalRecord {
  appointmentId: number
  patientId: number
  patientName: string
  patientPhone: string | null
  patientEmail: string | null
  patientGender: 'NAM' | 'NU'
  patientBirth: string
  patientAddress: string | null
  doctorId: number | null
  doctorName: string | null
  departmentId: number | null
  departmentName: string | null
  healthPlanId: number | null
  healthPlanName: string | null
  symptoms: string | null
  appointmentDate: string
  appointmentTime: string
}

/**
 * Save appointment data to localStorage for medical record creation
 */
export function saveAppointmentForMedicalRecord(
  data: AppointmentDataForMedicalRecord
): void {
  try {
    localStorage.setItem(APPOINTMENT_DATA_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save appointment data to localStorage:', error)
  }
}

/**
 * Get appointment data from localStorage
 */
export function getAppointmentForMedicalRecord(): AppointmentDataForMedicalRecord | null {
  try {
    const data = localStorage.getItem(APPOINTMENT_DATA_KEY)
    if (!data) return null
    return JSON.parse(data) as AppointmentDataForMedicalRecord
  } catch (error) {
    console.error('Failed to get appointment data from localStorage:', error)
    return null
  }
}

/**
 * Clear appointment data from localStorage
 */
export function clearAppointmentForMedicalRecord(): void {
  try {
    localStorage.removeItem(APPOINTMENT_DATA_KEY)
  } catch (error) {
    console.error('Failed to clear appointment data from localStorage:', error)
  }
}
