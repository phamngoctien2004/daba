import { z } from 'zod'

export const patientFormSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  phone: z.string().nullable().refine(
    (val) => !val || /^\d+$/.test(val),
    { message: 'Số điện thoại chỉ được chứa số' }
  ),
  phoneLink: z.string().nullable().refine(
    (val) => !val || /^\d+$/.test(val),
    { message: 'Số điện thoại liên hệ chỉ được chứa số' }
  ),
  email: z.string().email('Email không hợp lệ').nullable().or(z.literal('')).transform(val => val === '' ? null : val),
  gender: z.enum(['NAM', 'NU'], {
    required_error: 'Vui lòng chọn giới tính',
  }),
  birth: z.string().min(1, 'Vui lòng chọn ngày sinh'),
  address: z.string().nullable(),
  cccd: z.string().nullable().refine(
    (val) => !val || /^\d+$/.test(val),
    { message: 'Số CCCD chỉ được chứa số' }
  ),
  bloodType: z.string().nullable().optional(),
  weight: z.number().min(0.1, 'Vui lòng nhập cân nặng'),
  height: z.number().min(0.1, 'Vui lòng nhập chiều cao'),
  profileImage: z.string().nullable().optional(),
}).refine(
  (data) => {
    // Validate that at least one of phone or phoneLink is not empty
    const hasPhone = data.phone && data.phone.trim() !== ''
    const hasPhoneLink = data.phoneLink && data.phoneLink.trim() !== ''
    return hasPhone || hasPhoneLink
  },
  {
    message: 'Vui lòng nhập ít nhất một số điện thoại (Số điện thoại hoặc SĐT liên hệ)',
    path: ['phone'], // This will show the error on the phone field
  }
)

export type PatientFormValues = z.infer<typeof patientFormSchema>
