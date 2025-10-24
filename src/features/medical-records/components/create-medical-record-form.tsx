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
import { QRPaymentModal } from '@/components/qr-payment-modal'
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
import { createPaymentLink } from '@/features/payments/api/payments'
import { wsClient } from '@/lib/websocket-client'
import { generatePaymentQRCode } from '@/lib/qr-code-generator'

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

  // Service detail state (for displaying room info and sub-plans)
  const [serviceDetail, setServiceDetail] = useState<any>(null)
  const [isLoadingServiceDetail, setIsLoadingServiceDetail] = useState(false)

  // Payment state
  const [createdMedicalRecordId, setCreatedMedicalRecordId] = useState<number | null>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  // QR Payment state
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [orderCode, setOrderCode] = useState<number | null>(null)
  const [invoiceIdForQR, setInvoiceIdForQR] = useState<number | null>(null)
  const [isCreatingQR, setIsCreatingQR] = useState(false)
  const [qrPaymentSuccess, setQrPaymentSuccess] = useState(false)

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
          }
          // Removed 'KHAC' option

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

  // 3. Load available doctors when examination type is 'doctor'
  useEffect(() => {
    // Only load if examination type is valid
    if (!examinationType) return

    const loadData = async () => {
      // Clear doctors for non-doctor examination types
      if (examinationType !== 'doctor') {
        setDoctors([])
        return
      }

      // Load available doctors from schedule API for 'doctor' examination type
      try {
        console.log('🔄 [Load Doctors] Loading available doctors from schedule...')

        // Import schedule API
        const { fetchAvailableDoctorsToday } = await import('@/features/schedules/api/schedules')
        const availableDoctors = await fetchAvailableDoctorsToday()

        console.log('✅ [Load Doctors] Loaded available doctors:', availableDoctors.length)

        // Convert AvailableDoctor to Doctor format
        const doctors = availableDoctors.map(ad => ({
          id: ad.id,
          fullName: ad.fullName,
          position: ad.position,
          name: ad.fullName,
          available: ad.available,
          roomName: ad.roomName,
          examinationFee: ad.examinationFee || 0,
        } as Doctor))

        setDoctors(doctors)

        // If there's a pre-selected doctor from appointment, set it
        if (appointmentData?.doctorId && selectedDoctorOrServiceId) {
          const doctor = doctors.find(d => d.id === appointmentData.doctorId)
          if (doctor) {
            console.log('✅ [Load Doctors] Found pre-selected doctor:', doctor.position)
            setSelectedDoctor(doctor)
            setIsInitialized(true)
          } else {
            console.warn('⚠️ [Load Doctors] Pre-selected doctor not available in current shift')
            setIsInitialized(true)
          }
        } else if (!appointmentData?.doctorId) {
          // No pre-selected doctor, just mark as initialized
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('❌ [Load Doctors] Failed to load available doctors:', error)
        // Fallback to loading all doctors if schedule API fails
        try {
          console.log('🔄 [Load Doctors] Falling back to all doctors...')
          const allDoctors = await fetchAllDoctors()
          setDoctors(allDoctors)
        } catch (fallbackError) {
          console.error('❌ [Load Doctors] Fallback failed:', fallbackError)
          setDoctors([])
        }
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

      // Update appointment status to HOAN_THANH if created from appointment
      if (appointmentData?.appointmentId) {
        try {
          console.log('🔄 [Update Appointment] Updating appointment status to HOAN_THANH:', appointmentData.appointmentId)
          await confirmAppointment({
            id: appointmentData.appointmentId,
            status: 'HOAN_THANH',
          })
          console.log('✅ [Update Appointment] Appointment status updated to HOAN_THANH successfully')
        } catch (error) {
          console.error('❌ [Update Appointment] Failed to update appointment status:', error)
          // Don't show error to user - this is a secondary action
        }
      }

      // Show success message
      toast.success('Tạo phiếu khám thành công')

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

  // WebSocket subscription cleanup
  useEffect(() => {
    return () => {
      // Cleanup WebSocket when component unmounts
      if (wsClient.isConnected()) {
        wsClient.disconnect()
      }
    }
  }, [])

  // Handle QR payment flow
  const handleQRPayment = async (formValues: CreateMedicalRecordInput) => {
    try {
      setIsCreatingQR(true)

      // Calculate amount (can be from health plan or doctor examination fee)
      const amount =
        selectedHealthPlan?.price || selectedDoctor?.examinationFee || 0

      // Step 1: Connect to WebSocket
      console.log('🔵 [QR Payment] Connecting to WebSocket...')
      await wsClient.connect()

      // Step 2: Create payment link FIRST (without medical record)
      console.log('🔵 [QR Payment] Creating payment link...')
      const paymentData = await createPaymentLink({
        medicalRecordId: 0, // Chưa có medical record, gửi 0 hoặc null
        totalAmount: amount,
        healthPlanIds: formValues.healthPlanId ? [formValues.healthPlanId] : [],
        doctorId: formValues.doctorId || 0,
      })

      console.log('✅ [QR Payment] Payment data received:', paymentData)

      // Step 3: Generate QR code image URL from qrCode string
      const qrCodeImageUrl = generatePaymentQRCode(paymentData.qrCode, '400x400')
      console.log('🔵 [QR Payment] Generated QR image URL:', qrCodeImageUrl)

      // Step 4: Show QR Modal
      setQrCode(qrCodeImageUrl) // Use generated image URL instead of raw string
      setOrderCode(paymentData.orderCode)
      setInvoiceIdForQR(paymentData.invoiceId)
      setShowQRModal(true)
      setIsCreatingQR(false)

      // Step 4: Subscribe to payment success event
      console.log(`🔵 [QR Payment] Subscribing to invoice.${paymentData.invoiceId}`)
      const unsubscribe = wsClient.subscribeToInvoicePayment(
        paymentData.invoiceId,
        async (event) => {
          console.log('✅ [QR Payment] Payment success event received:', event)

          // Mark payment as successful
          setQrPaymentSuccess(true)
          toast.success('Thanh toán thành công!')

          try {
            // Step 5: NOW create medical record with invoiceId
            console.log('� [QR Payment] Creating medical record with invoiceId...')
            const payload: CreateMedicalRecordPayload = {
              patientId: formValues.patientId,
              doctorId: formValues.doctorId,
              healthPlanId: formValues.healthPlanId,
              symptoms: formValues.symptoms,
              appointmentId: null,
              invoiceId: paymentData.invoiceId, // ← GỬI INVOICE ID
            }

            const result = await createMedicalRecord(payload)
            const medicalRecordId = result.medicalRecordId

            console.log('✅ [QR Payment] Medical record created:', medicalRecordId)
            setCreatedMedicalRecordId(medicalRecordId)


            // Step 7: Print invoice
            console.log('🖨️ [QR Payment] Printing invoice...')
            const htmlContent = await exportInvoiceHtml(medicalRecordId)

            const printWindow = window.open('', '_blank')
            if (printWindow) {
              printWindow.document.write(htmlContent)
              printWindow.document.close()
            }

            // Cleanup
            setTimeout(() => {
              unsubscribe()
              setShowQRModal(false)
              setPaymentCompleted(true)

              // Clear form and localStorage
              // form.reset()
              clearAppointmentForMedicalRecord()

              // Invalidate queries
              void queryClient.invalidateQueries({ queryKey: ['appointments'] })
            }, 2000) // Wait 2s to show success message
          } catch (error) {
            console.error('❌ [QR Payment] Create medical record error:', error)
            toast.error('Thanh toán thành công nhưng không thể tạo phiếu khám. Vui lòng liên hệ quản trị viên.')

            // Still cleanup
            unsubscribe()
            setShowQRModal(false)
          }
        }
      )
    } catch (error) {
      console.error('❌ [QR Payment] Error:', error)
      setIsCreatingQR(false)
      toast.error(
        error instanceof Error ? error.message : 'Không thể tạo mã QR thanh toán'
      )
    }
  }

  const onSubmit = async (values: CreateMedicalRecordInput) => {
    const payload: CreateMedicalRecordPayload = {
      patientId: values.patientId,
      doctorId: values.doctorId,
      healthPlanId: values.healthPlanId,
      symptoms: values.symptoms,
      // Gửi kèm appointmentId nếu bệnh nhân đã đặt lịch
      appointmentId: appointmentData?.appointmentId ?? null,
    }

    console.log('📤 [CreateMedicalRecordForm] Submitting payload:', payload)

    // For paid appointments, just create medical record
    if (appointmentData?.isPaidFromAppointment) {
      createMedicalRecordMutation(payload)
      return
    }

    // For unpaid, check payment method
    if (values.paymentMethod === 'qr') {
      // Show QR payment first, then create medical record after payment success
      await handleQRPayment(values)
    } else {
      // Cash payment - use existing flow
      createMedicalRecordMutation(payload)
    }
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
                  setServiceDetail(null)
                  setIsLoadingServiceDetail(false)
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
                          examinationType === 'CHUYEN_KHOA' ? 'Chuyên khoa' : 'Bác sĩ'}{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    {examinationType !== 'doctor' && examinationType !== 'department' ? (
                      // Show filtered services list (DICH_VU, XET_NGHIEM, CHUYEN_KHOA)
                      <Select
                        disabled={isLoadingHealthPlans || isCreatingRecord || !!createdMedicalRecordId}
                        value={selectedDoctorOrServiceId}
                        onValueChange={async (value) => {
                          setSelectedDoctorOrServiceId(value)
                          const healthPlanId = Number(value)
                          form.setValue('healthPlanId', healthPlanId)
                          const healthPlan = filteredHealthPlans.find((hp) => hp.id === healthPlanId)
                          setSelectedHealthPlan(healthPlan || null)
                          // Also set third select value to show selected service
                          setSelectedThirdSelect(value)

                          // Load service detail
                          if (healthPlanId) {
                            setIsLoadingServiceDetail(true)
                            try {
                              const { fetchServiceDetail } = await import('@/features/health-plans/api/services')
                              const detail = await fetchServiceDetail(healthPlanId)
                              setServiceDetail(detail)
                              console.log('✅ [Service Detail] Loaded:', detail)
                            } catch (error) {
                              console.error('❌ [Service Detail] Failed to load:', error)
                              setServiceDetail(null)
                            } finally {
                              setIsLoadingServiceDetail(false)
                            }
                          } else {
                            setServiceDetail(null)
                          }
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

          {/* Doctor/Service Info Display */}
          {selectedDoctor && (
            <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/20">
              <h4 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">
                Thông tin bác sĩ
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bác sĩ:</span>
                  <span className="font-medium">{selectedDoctor.position || selectedDoctor.fullName}</span>
                </div>
                {selectedDoctor.roomName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phòng khám:</span>
                    <span className="font-medium">{selectedDoctor.roomName}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Chi phí:</span>
                  <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {(selectedDoctor.examinationFee || 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
            </div>
          )}

          {serviceDetail && (
            <div className="rounded-lg border bg-purple-50 p-4 dark:bg-purple-900/20">
              <h4 className="mb-3 font-semibold text-purple-900 dark:text-purple-100">
                Thông tin dịch vụ
              </h4>

              {/* Service Package with Sub-plans */}
              {serviceDetail.subPlans && Array.isArray(serviceDetail.subPlans) && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gói dịch vụ:</span>
                    <span className="font-medium">{serviceDetail.name}</span>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Bao gồm {serviceDetail.subPlans.length} dịch vụ:
                    </p>
                    <div className="space-y-2">
                      {serviceDetail.subPlans.map((subPlan: any, index: number) => (
                        <div
                          key={subPlan.id || index}
                          className="rounded-md border bg-white p-3 dark:bg-gray-800"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium">{subPlan.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {subPlan.roomName}
                              </p>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-muted-foreground">Tổng chi phí:</span>
                    <span className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      {serviceDetail.price.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
              )}

              {/* Single Service */}
              {serviceDetail.roomName && !serviceDetail.subPlans && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dịch vụ:</span>
                    <span className="font-medium">{serviceDetail.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phòng:</span>
                    <span className="font-medium">{serviceDetail.roomName}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Chi phí:</span>
                    <span className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      {serviceDetail.price.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading service detail */}
          {isLoadingServiceDetail && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Đang tải thông tin dịch vụ...</span>
              </div>
            </div>
          )}


          {/* Payment Status/Method */}
          {appointmentData?.isPaidFromAppointment ? (
            /* Show payment success message when created from paid appointment */
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    Đã thanh toán
                  </h4>
                  <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                    Số tiền: {appointmentData.totalAmount?.toLocaleString('vi-VN') ?? 0} VNĐ
                  </p>
                  {appointmentData.invoiceCode && (
                    <p className="mt-0.5 text-xs text-green-700 dark:text-green-300">
                      Mã hóa đơn: {appointmentData.invoiceCode}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-green-700 dark:text-green-300">
                    Đã thanh toán khi đặt lịch khám
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Show payment method selection for walk-in patients */
            !createdMedicalRecordId && (
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
            )
          )}

          {/* Form Actions */}
          <div className="flex flex-wrap gap-4">
            {/* Only show buttons if payment not completed */}
            {!paymentCompleted && (
              <>
                <Button type="submit" disabled={isCreatingRecord}>
                  {isCreatingRecord && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {appointmentData?.isPaidFromAppointment ? 'Tạo phiếu khám' : 'Xác nhận thanh toán'}
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

          </div>
        </form>
      </Form>

      {/* QR Payment Modal */}
      <QRPaymentModal
        open={showQRModal}
        qrCode={qrCode}
        orderCode={orderCode}
        amount={selectedHealthPlan?.price || selectedDoctor?.examinationFee || 0}
        isConnecting={isCreatingQR}
        paymentSuccess={qrPaymentSuccess}
        onClose={() => {
          setShowQRModal(false)
          setQrPaymentSuccess(false)
        }}
        onForceClose={() => {
          setShowQRModal(false)
          setQrPaymentSuccess(false)
          wsClient.disconnect()
          toast.warning('Đã hủy thanh toán QR')
        }}
      />
    </div>
  )
}
