import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/date-picker'
import { patientFormSchema, type PatientFormValues } from '@/lib/validations/patient.schema'
import { updatePatient, type UpdatePatientPayload, type Patient } from '../api/patients'

interface EditPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
}

const BLOOD_TYPES = ['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export function EditPatientDialog({
  open,
  onOpenChange,
  patient,
}: EditPatientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      fullName: '',
      phone: null,
      phoneLink: null,
      email: '',
      gender: 'NAM',
      birth: '',
      address: null,
      cccd: null,
      bloodType: null,
      weight: undefined as any,
      height: undefined as any,
      profileImage: null,
    },
  })

  // Load patient data when dialog opens
  useEffect(() => {
    if (patient && open) {
      form.reset({
        fullName: patient.fullName || '',
        phone: patient.phone || null,
        phoneLink: null, // phoneLink not in patient type, set to null
        email: patient.email || '',
        gender: patient.gender as 'NAM' | 'NU',
        birth: patient.birth || '',
        address: patient.address || null,
        cccd: patient.cccd || null,
        bloodType: patient.bloodType || null,
        weight: patient.weight ?? undefined as any,
        height: patient.height ?? undefined as any,
        profileImage: patient.profileImage || null,
      })
    }
  }, [patient, open, form])

  const updateMutation = useMutation({
    mutationFn: updatePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-patients'] })
      toast.success('Đã cập nhật thông tin bệnh nhân')
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật bệnh nhân')
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const onSubmit = (values: PatientFormValues) => {
    if (!patient) return

    setIsSubmitting(true)

    const payload: UpdatePatientPayload = {
      id: patient.id,
      fullName: values.fullName,
      phone: values.phone || null,
      phoneLink: values.phoneLink || null,
      email: values.email || null,
      gender: values.gender,
      birth: values.birth,
      address: values.address || null,
      cccd: values.cccd || null,
      bloodType: values.bloodType || null,
      weight: values.weight ?? null,
      height: values.height ?? null,
      profileImage: values.profileImage || null,
    }

    updateMutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Cập nhật thông tin bệnh nhân</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin bệnh nhân. Lưu ý: Ít nhất một trong hai số điện thoại phải được nhập.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Họ tên */}
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên <span className='text-destructive'>*</span></FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập họ và tên' {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone & PhoneLink */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập số điện thoại'
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          field.onChange(value || null)
                        }}
                        disabled={isSubmitting}
                        inputMode='numeric'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phoneLink'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SĐT liên hệ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập SĐT liên hệ'
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          field.onChange(value || null)
                        }}
                        disabled={isSubmitting}
                        inputMode='numeric'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nhập email'
                      type='email'
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender & Birth */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính <span className='text-destructive'>*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn giới tính' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='NAM'>Nam</SelectItem>
                        <SelectItem value='NU'>Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='birth'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Ngày sinh <span className='text-destructive'>*</span></FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                        }}
                        placeholder='Chọn ngày sinh'
                        className='w-full'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* CCCD */}
            <FormField
              control={form.control}
              name='cccd'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số CCCD</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nhập số CCCD'
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        field.onChange(value || null)
                      }}
                      disabled={isSubmitting}
                      inputMode='numeric'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nhập địa chỉ'
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Blood Type, Weight, Height */}
            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='bloodType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhóm máu</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BLOOD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='weight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cân nặng (kg) <span className='text-destructive'>*</span></FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        placeholder='50'
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val ? parseFloat(val) : undefined)
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='height'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chiều cao (cm) <span className='text-destructive'>*</span></FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        placeholder='173'
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val ? parseFloat(val) : undefined)
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className='flex justify-end gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Cập nhật
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
