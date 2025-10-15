import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { AppointmentsManagement } from '@/features/appointments'

const statusEnum = z.enum([
  'DA_XAC_NHAN',
  'KHONG_DEN',
  'DANG_KHAM',
])

const appointmentsSearchSchema = z.object({
  phone: z.string().trim().optional().catch(''),
  date: z.string().trim().optional().catch(undefined),
  status: z
    .union([z.array(statusEnum), statusEnum.transform((value) => [value])])
    .optional()
    .catch([]),
  page: z.coerce.number().int().positive().optional().catch(undefined),
  pageSize: z
    .coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute('/_authenticated/appointments/')({
  validateSearch: (search) => appointmentsSearchSchema.parse(search),
  component: AppointmentsManagement,
})
