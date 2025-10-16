import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import {
  getAppointmentForMedicalRecord,
  clearAppointmentForMedicalRecord,
  type AppointmentDataForMedicalRecord,
} from '@/lib/appointment-storage'
import {
  createMedicalRecord,
  exportInvoiceHtml,
  type CreateMedicalRecordPayload,
} from '../api/medical-records'
import { confirmAppointment } from '@/features/appointments/api/appointments'
import {
  createMedicalRecordSchema,
  type CreateMedicalRecordInput,
} from '@/lib/validations/medical-record.schema'
import {
  fetchAllDoctors,
  type Doctor,
} from '@/features/departments/api/departments'
import { fetchHealthPlans, type HealthPlan } from '@/features/health-plans/api/services'

interface CreateMedicalRecordFormProps {
  onSuccess?: (medicalRecordId?: number) => void
  onCancel?: () => void
}

export function CreateMedicalRecordForm({
  onSuccess: _onSuccess,
  onCancel,
}: CreateMedicalRecordFormProps) {
  const queryClient = useQueryClient()

  const [appointmentData, setAppointmentData] =
    useState<AppointmentDataForMedicalRecord | null>(null)
  // Examination type: 'doctor', 'DICH_VU', 'XET_NGHIEM', 'CHUYEN_KHOA', 'KHAC'
  const [examinationType, setExaminationType] = useState<string>('')
  const [selectedDoctorOrServiceId, setSelectedDoctorOrServiceId] = useState<string>('') // For Select 2
  const [selectedThirdSelect, setSelectedThirdSelect] = useState<string>('') // For Select 3
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedHealthPlan, setSelectedHealthPlan] = useState<HealthPlan | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Payment state
  const [createdMedicalRecordId, setCreatedMedicalRecordId] = useState<number | null>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  // Load appointment data from localStorage on mount and clear previous data
  useEffect(() => {
    // Clear all previous state
    setExaminationType('')
    setSelectedDoctorOrServiceId('')
    setSelectedThirdSelect('')
    setDoctors([])
    setSelectedDoctor(null)
    setSelectedHealthPlan(null)
    setIsInitialized(false)

    // Load new appointment data
    const data = getAppointmentForMedicalRecord()
    if (data) {
      console.log('🔵 [CreateMedicalRecordForm] Loaded appointment data:', data)
      setAppointmentData(data)
    }
  }, [])

  // 1. Fetch health plans (services) on mount
  const { data: healthPlans = [], isLoading: isLoadingHealthPlans, error: healthPlansError } = useQuery({
    queryKey: ['health-plans'],
    queryFn: fetchHealthPlans,
  })

  // Debug: Log data and errors
  if (healthPlansError) console.error('Health Plans Error:', healthPlansError)
  console.log('Health Plans loaded:', healthPlans.length, healthPlans)

  // Filter health plans by type based on examination type
  const filteredHealthPlans = healthPlans.filter((plan) => {
    if (!examinationType || examinationType === 'doctor') return false

    if (examinationType === 'DICH_VU') {
      return plan.type === 'DICH_VU'
    } else if (examinationType === 'XET_NGHIEM') {
      return plan.type === 'XET_NGHIEM'
    } else if (examinationType === 'CHUYEN_KHOA') {
      return plan.type === 'CHUYEN_KHOA'
    } else if (examinationType === 'KHAC') {
      // Các type khác ngoài 3 type trên
      return plan.type !== 'DICH_VU' && plan.type !== 'XET_NGHIEM' && plan.type !== 'CHUYEN_KHOA'
    }
    return false
  })

  // Form setup
  const form = useForm<CreateMedicalRecordInput>({
    resolver: zodResolver(createMedicalRecordSchema),
    defaultValues: {
      patientId: 0,
      doctorId: null,
      healthPlanId: 0,
      symptoms: '',
      paymentMethod: 'cash',
    },
  })

  // 2. Parse appointmentData to auto-fill form (wait for data to load)
  useEffect(() => {
    if (!appointmentData || isInitialized) return

    console.log('🟢 [Auto-fill] Starting auto-fill with appointment data')

    // Set basic form values
    form.setValue('patientId', appointmentData.patientId)
    form.setValue('symptoms', appointmentData.symptoms || '')

    // Auto-detect examination type from appointment data
    if (appointmentData.healthPlanId) {
      console.log('🟢 [Auto-fill] Detected health plan:', appointmentData.healthPlanId)
      // Service examination - wait for health plans to load
      if (healthPlans.length > 0) {
        const healthPlan = healthPlans.find((hp) => hp.id === appointmentData.healthPlanId)
        if (healthPlan) {
          console.log('✅ [Auto-fill] Found health plan:', healthPlan.name, 'type:', healthPlan.type)

          // Auto-detect examination type based on health plan type
          if (healthPlan.type === 'DICH_VU') {
            setExaminationType('DICH_VU')
          } else if (healthPlan.type === 'XET_NGHIEM') {
            setExaminationType('XET_NGHIEM')
          } else if (healthPlan.type === 'CHUYEN_KHOA') {
            setExaminationType('CHUYEN_KHOA')
          } else {
            setExaminationType('KHAC')
          }

          const healthPlanIdStr = String(appointmentData.healthPlanId)
          setSelectedDoctorOrServiceId(healthPlanIdStr)
          setSelectedThirdSelect(healthPlanIdStr)
          form.setValue('healthPlanId', appointmentData.healthPlanId)
          setSelectedHealthPlan(healthPlan)
          setIsInitialized(true)
        }
      }
    } else if (appointmentData.doctorId) {
      console.log('🟢 [Auto-fill] Detected doctor:', appointmentData.doctorId)
      // Doctor examination (default) - will be handled when doctors load
      setExaminationType('doctor')
      const doctorIdStr = String(appointmentData.doctorId)
      setSelectedDoctorOrServiceId(doctorIdStr)
      form.setValue('doctorId', appointmentData.doctorId)
      // Will set doctor after loading all doctors
    }
  }, [appointmentData, form, healthPlans, isInitialized])

  // 3. Load doctors when examination type is 'doctor'
  useEffect(() => {
    // Only load if examination type is valid
    if (!examinationType) return

    const loadData = async () => {
      // Clear doctors for non-doctor examination types
      if (examinationType !== 'doctor') {
        setDoctors([])
        return
      }

      // Load all doctors for 'doctor' examination type
      try {
        console.log('🔄 [Load Doctors] Loading all doctors...')
        const allDoctors = await fetchAllDoctors()
        console.log('✅ [Load Doctors] Loaded doctors:', allDoctors.length)
        setDoctors(allDoctors)

        // If there's a pre-selected doctor from appointment, set it
        if (appointmentData?.doctorId && selectedDoctorOrServiceId) {
          const doctor = allDoctors.find(d => d.id === appointmentData.doctorId)
          if (doctor) {
            console.log('✅ [Load Doctors] Found pre-selected doctor:', doctor.position)
            setSelectedDoctor(doctor)
            setIsInitialized(true)
          }
        } else if (!appointmentData?.doctorId) {
          // No pre-selected doctor, just mark as initialized
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('❌ [Load Doctors] Failed to load doctors:', error)
        setDoctors([])
        setIsInitialized(true)
      }
    }

    loadData()
  }, [examinationType, appointmentData, selectedDoctorOrServiceId])

  // Create medical record mutation
  const { mutate: createMedicalRecordMutation, isPending: isCreatingRecord } = useMutation({
    mutationFn: createMedicalRecord,
    onSuccess: async (result) => {
      const medicalRecordId = result.medicalRecordId
      console.log('✅ [Create Record] Medical record created:', medicalRecordId)

      // Save the created medical record ID
      setCreatedMedicalRecordId(medicalRecordId)
      setPaymentCompleted(true)

      // Update appointment status to DANG_KHAM
      if (appointmentData?.appointmentId) {
        try {
          console.log('🔄 [Update Appointment] Updating appointment status to DANG_KHAM:', appointmentData.appointmentId)
          await confirmAppointment({
            id: appointmentData.appointmentId,
            status: 'DANG_KHAM',
          })
          console.log('✅ [Update Appointment] Appointment status updated successfully')
        } catch (error) {
          console.error('❌ [Update Appointment] Failed to update appointment status:', error)
          // Don't show error to user - this is a secondary action
        }
      }

      // Show success message
      toast.success('Tạo phiếu khám và thanh toán thành công')

      // Auto-print invoice immediately after payment success
      try {
        const htmlContent = await exportInvoiceHtml(medicalRecordId)

        // Create a new window to display the HTML content
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(htmlContent)
          printWindow.document.close()

          // // Wait for content to load then trigger print
          // printWindow.onload = () => {
          //   printWindow.focus()
          //   printWindow.print()
          // }
        } else {
          toast.error('Không thể mở cửa sổ in. Vui lòng kiểm tra trình chặn popup.')
        }
      } catch (error) {
        console.error('Print invoice error:', error)
        toast.error('Lỗi khi in hóa đơn', {
          description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        })
      }

      // Clear form and localStorage
      form.reset()
      clearAppointmentForMedicalRecord()

      // Invalidate appointments queries to force refetch
      void queryClient.invalidateQueries({ queryKey: ['appointments'] })
      console.log('🔄 [Invalidate Queries] Appointments queries invalidated')

      // Call onSuccess to navigate back to appointments list
      // onSuccess?.(medicalRecordId)
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể tạo phiếu khám. Vui lòng thử lại.'
      toast.error(message)
    },
  })

  const onSubmit = (values: CreateMedicalRecordInput) => {
    const payload: CreateMedicalRecordPayload = {
      patientId: values.patientId,
      doctorId: values.doctorId,
      healthPlanId: values.healthPlanId,
      symptoms: values.symptoms,
    }

    createMedicalRecordMutation(payload)
  }

  if (!appointmentData) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">
          Không tìm thấy thông tin lịch khám. Vui lòng quay lại trang danh sách lịch khám.
        </p>
      </div>
    )
  }

  // Debug logging
  console.log('🎯 [Render] Current state:', {
    examinationType,
    selectedDoctorOrServiceId,
    selectedThirdSelect,
    doctorsCount: doctors.length,
    healthPlansCount: healthPlans.length,
    filteredHealthPlansCount: filteredHealthPlans.length,
    selectedDoctor: selectedDoctor?.position,
    selectedHealthPlan: selectedHealthPlan?.name,
    isInitialized,
    appointmentData: appointmentData ? {
      healthPlanId: appointmentData.healthPlanId,
      doctorId: appointmentData.doctorId,
      departmentId: appointmentData.departmentId,
    } : null,
  })

  return (
    <div className="space-y-6">
      {/* Patient Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bệnh nhân</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Họ và tên</p>
            <p className="text-base">{appointmentData.patientName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
            <p className="text-base">{appointmentData.patientPhone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{appointmentData.patientEmail || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Giới tính</p>
            <p className="text-base">
              {appointmentData.patientGender === 'NAM' ? 'Nam' : 'Nữ'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ngày sinh</p>
            <p className="text-base">{appointmentData.patientBirth}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Địa chỉ</p>
            <p className="text-base">{appointmentData.patientAddress || 'N/A'}</p>
          </div>
          {appointmentData.doctorName && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bác sĩ</p>
              <p className="text-base">{appointmentData.doctorName}</p>
            </div>
          )}
          {appointmentData.departmentName && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Khoa</p>
              <p className="text-base">{appointmentData.departmentName}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ngày khám</p>
            <p className="text-base">
              {appointmentData.appointmentDate} - {appointmentData.appointmentTime}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Medical Record Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 3 Selects in One Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Select 1: Examination Type */}
            <div>
              <label className="text-sm font-medium leading-none">
                Loại khám <span className="text-destructive">*</span>
              </label>
              <Select
                disabled={isCreatingRecord || !!createdMedicalRecordId}
                value={examinationType || undefined}
                onValueChange={(value) => {
                  console.log('🔄 Examination type changed to:', value)
                  // Prevent empty value
                  if (!value) return

                  // If same value, no need to reset
                  if (value === examinationType) return

                  setExaminationType(value)
                  // Reset dependent fields when user changes examination type
                  setSelectedDoctorOrServiceId('')
                  setSelectedThirdSelect('')
                  form.setValue('doctorId', null)
                  form.setValue('healthPlanId', 0)
                  setSelectedHealthPlan(null)
                  setSelectedDoctor(null)
                  setDoctors([])
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Chọn loại khám" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Bác sĩ</SelectItem>
                  <SelectItem value="DICH_VU">Gói khám</SelectItem>
                  <SelectItem value="XET_NGHIEM">Xét nghiệm</SelectItem>
                  <SelectItem value="CHUYEN_KHOA">Chuyên khoa</SelectItem>
                  <SelectItem value="KHAC">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Select 2: Service or Doctor (conditional) */}
            {examinationType && (
              <FormField
                control={form.control}
                name={examinationType === 'service' ? 'healthPlanId' : 'doctorId'}
                render={() => (
                  <FormItem>
                    <FormLabel>
                      {examinationType === 'DICH_VU' ? 'Gói khám' :
                        examinationType === 'XET_NGHIEM' ? 'Xét nghiệm' :
                          examinationType === 'CHUYEN_KHOA' ? 'Chuyên khoa' :
                            examinationType === 'KHAC' ? 'Dịch vụ khác' : 'Bác sĩ'}{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    {examinationType !== 'doctor' && examinationType !== 'department' ? (
                      // Show filtered services list (DICH_VU, XET_NGHIEM, CHUYEN_KHOA, KHAC)
                      <Select
                        disabled={isLoadingHealthPlans || isCreatingRecord || !!createdMedicalRecordId}
                        value={selectedDoctorOrServiceId}
                        onValueChange={(value) => {
                          setSelectedDoctorOrServiceId(value)
                          const healthPlanId = Number(value)
                          form.setValue('healthPlanId', healthPlanId)
                          const healthPlan = filteredHealthPlans.find((hp) => hp.id === healthPlanId)
                          setSelectedHealthPlan(healthPlan || null)
                          // Also set third select value to show selected service
                          setSelectedThirdSelect(value)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingHealthPlans ? "Đang tải..." : "Chọn dịch vụ"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredHealthPlans.length === 0 ? (
                            <div className="py-2 px-3 text-sm text-muted-foreground">
                              {isLoadingHealthPlans ? 'Đang tải...' : 'Không có dịch vụ nào'}
                            </div>
                          ) : (
                            filteredHealthPlans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id.toString()}>
                                {plan.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      // Show all doctors list (for 'doctor' examination type)
                      <Select
                        disabled={isCreatingRecord || doctors.length === 0 || !!createdMedicalRecordId}
                        value={selectedDoctorOrServiceId}
                        onValueChange={(value) => {
                          setSelectedDoctorOrServiceId(value)
                          form.setValue('doctorId', value ? Number(value) : null)
                          // Find and save selected doctor
                          const doctor = doctors.find(d => d.id === Number(value))
                          setSelectedDoctor(doctor || null)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={doctors.length === 0 ? "Đang tải..." : "Chọn bác sĩ"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                              {doctor.position || doctor.fullName || doctor.name || 'N/A'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

          </div>

          {/* Calculated Fee Display */}
          {(selectedHealthPlan || selectedDoctor) && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chi phí khám:</span>
                <span className="text-lg font-bold">
                  {selectedHealthPlan
                    ? (selectedHealthPlan.fee || selectedHealthPlan.price || 0).toLocaleString('vi-VN')
                    : (selectedDoctor?.examinationFee || 0).toLocaleString('vi-VN')
                  } VNĐ
                </span>
              </div>
            </div>
          )}

          {/* Symptoms */}
          <FormField
            control={form.control}
            name="symptoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Triệu chứng <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mô tả triệu chứng của bệnh nhân"
                    className="min-h-[100px] resize-none"
                    disabled={isCreatingRecord || !!createdMedicalRecordId}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Method - Show before record is created */}
          {!createdMedicalRecordId && (
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>
                    Phương thức thanh toán <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                      disabled={isCreatingRecord || !!createdMedicalRecordId}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cash" />
                        </FormControl>
                        <FormLabel className="font-normal">Tiền mặt</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="qr" />
                        </FormControl>
                        <FormLabel className="font-normal">Chuyển khoản QR</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Form Actions */}
          <div className="flex flex-wrap gap-4">
            {/* Only show buttons if payment not completed */}
            {!paymentCompleted && (
              <>
                <Button type="submit" disabled={isCreatingRecord}>
                  {isCreatingRecord && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Xác nhận thanh toán
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isCreatingRecord}
                >
                  Hủy
                </Button>
              </>
            )}

            {/* Show success message after payment */}
            {paymentCompleted && (
              <div className="w-full rounded-lg border bg-green-50 p-4 text-green-900 dark:bg-green-900/20 dark:text-green-100">
                <p className="font-semibold">Thanh toán thành công!</p>
                <p className="text-sm mt-1">
                  Hóa đơn đã được in tự động. Bạn có thể tiếp tục tạo phiếu khám mới hoặc quay lại danh sách.
                </p>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
