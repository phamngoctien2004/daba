import { z } from 'zod'

/**
 * Medical Record validation schemas
 */
export const createMedicalRecordSchema = z.object({
  patientId: z.number().min(1, 'Patient ID là bắt buộc'),
  doctorId: z.number().nullable().optional(),
  healthPlanId: z.number().optional(), // Optional - chỉ bắt buộc khi chọn gói khám
  symptoms: z.string().min(1, 'Triệu chứng là bắt buộc').max(2000, 'Triệu chứng không được vượt quá 2000 ký tự'),
  paymentMethod: z.enum(['cash', 'qr'], { message: 'Vui lòng chọn phương thức thanh toán' }),
})

export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>
