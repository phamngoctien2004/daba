import { z } from 'zod'

/**
 * Phone validation schema
 * Pattern: ^0\d{9}$ (10 digits starting with 0)
 */
export const phoneSchema = z
  .string()
  .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 chữ số)')
  .optional()
  .or(z.literal(''))

/**
 * Create Appointment validation schema
 */
export const createAppointmentSchema = z
  .object({
    patientId: z.number({ required_error: 'Vui lòng chọn bệnh nhân' }).min(1, 'Vui lòng chọn bệnh nhân'),
    departmentId: z.number({ required_error: 'Vui lòng chọn khoa' }).min(1, 'Vui lòng chọn khoa'),
    doctorId: z.number({ required_error: 'Vui lòng chọn bác sĩ' }).min(1, 'Vui lòng chọn bác sĩ'),
    healthPlanId: z.number().optional(),
    fullName: z.string().min(1, 'Họ tên là bắt buộc'),
    phone: phoneSchema,
    gender: z.enum(['NAM', 'NU'], {
      errorMap: () => ({ message: 'Vui lòng chọn giới tính' }),
    }),
    birth: z.string().min(1, 'Ngày sinh là bắt buộc'),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    address: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày khám không hợp lệ (định dạng: YYYY-MM-DD)'),
    time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Giờ khám không hợp lệ (định dạng: HH:mm)'),
    symptoms: z.string().max(1000, 'Triệu chứng không được vượt quá 1000 ký tự').optional(),
  })
  .refine(
    (data) => {
      // Validate that appointment date+time is in the future
      try {
        // Convert time to HH:mm:ss if needed
        const time = data.time.length === 5 ? `${data.time}:00` : data.time
        const appointmentDateTime = new Date(`${data.date}T${time}`)
        const now = new Date()
        return appointmentDateTime > now
      } catch {
        return false
      }
    },
    {
      message: 'Thời gian khám phải trong tương lai',
      path: ['date'],
    }
  )

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>

/**
 * Patient validation schemas
 */
export const cccdSchema = z
  .string()
  .regex(/^\d{9,12}$/, 'Số CCCD phải từ 9-12 chữ số')
  .optional()
  .or(z.literal(''))

export const createPatientSchema = z.object({
  name: z.string().min(1, 'Họ tên là bắt buộc').max(100, 'Họ tên không được vượt quá 100 ký tự'),
  phone: phoneSchema,
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  gender: z.enum(['NAM', 'NU'], {
    errorMap: () => ({ message: 'Vui lòng chọn giới tính' }),
  }),
  birth: z.string().refine(
    (date) => {
      try {
        const birthDate = new Date(date)
        const today = new Date()
        return birthDate <= today
      } catch {
        return false
      }
    },
    { message: 'Ngày sinh không thể trong tương lai' }
  ),
  address: z.string().optional(),
  cccd: cccdSchema,
  bhyt: z.string().optional(),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
