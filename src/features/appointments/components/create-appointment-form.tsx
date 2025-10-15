import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'

import {
  createAppointmentSchema,
  type CreateAppointmentInput,
} from '@/lib/validations/appointment.schema'
import { createAppointment } from '../api/appointments'
import { fetchDepartments, fetchDoctorsByDepartment } from '@/features/departments/api/departments'
import { type Patient } from '@/features/patients/api/patients'
import { } from '@/lib/appointment-storage'

import { PatientSearch } from '@/features/patients/components/patient-search'
import { CreatePatientDialog } from '@/features/patients/components/create-patient-dialog'

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
import { TimePicker } from '@/components/time-picker'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon, Loader2 } from 'lucide-react'

interface CreateAppointmentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateAppointmentForm({
  onSuccess,
  onCancel,
}: CreateAppointmentFormProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isCreatePatientOpen, setIsCreatePatientOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null)

  const form = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: 0,
      departmentId: 0,
      doctorId: 0,
      fullName: '',
      phone: '',
      gender: 'NAM',
      birth: '',
      email: '',
      address: '',
      date: '',
      time: '',
      symptoms: '',
    },
  })

  // Fetch departments
  const { data: departments = [], isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  })

  // Fetch doctors by selected department
  const { data: doctors = [], isLoading: isDoctorsLoading } = useQuery({
    queryKey: ['doctors', selectedDepartment],
    queryFn: () => fetchDoctorsByDepartment(selectedDepartment!),
    enabled: !!selectedDepartment,
  })

  // Create appointment mutation
  const { mutate: createAppointmentMutation, isPending: isCreating } = useMutation({
    mutationFn: createAppointment,
    onSuccess: (data) => {
      toast.success(data.message)
      form.reset()
      setSelectedPatient(null)
      setSelectedDepartment(null)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'C� l�i x�y ra khi �t l�ch kh�m')
    },
  })

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    form.setValue('patientId', patient.id)
    form.setValue('fullName', patient.fullName)
    form.setValue('phone', patient.phone || '')
    form.setValue('gender', patient.gender === 'KHAC' ? 'NAM' : patient.gender)
    form.setValue('birth', patient.birth || '')
    form.setValue('email', patient.email || '')
    form.setValue('address', patient.address || '')
  }



  const handleDepartmentChange = (value: string) => {
    const deptId = parseInt(value)
    setSelectedDepartment(deptId)
    form.setValue('departmentId', deptId)
    form.setValue('doctorId', 0) // Reset doctor selection
  }

  const onSubmit = (data: CreateAppointmentInput) => {
    // Convert time to HH:mm:ss format if needed
    const time = data.time.length === 5 ? `${data.time}:00` : data.time

    createAppointmentMutation({
      ...data,
      time,
    })
  }

  const isFormDisabled = isCreating

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Search */}
          <FormField
            control={form.control}
            name="patientId"
            render={() => (
              <FormItem>
                <FormLabel>B�nh nh�n *</FormLabel>
                <FormControl>
                  <PatientSearch
                    value={selectedPatient}
                    onSelect={handlePatientSelect}
                    onCreateNew={() => setIsCreatePatientOpen(true)}
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Patient Info (Read-only when patient selected) */}
          {selectedPatient && (
            <div className="rounded-lg border p-4 bg-muted/50 space-y-3">
              <h3 className="font-medium text-sm">Th�ng tin b�nh nh�n</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">H� t�n:</span>{' '}
                  <span className="font-medium">{selectedPatient.fullName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ST:</span>{' '}
                  <span className="font-medium">{selectedPatient.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ng�y sinh:</span>{' '}
                  <span className="font-medium">{selectedPatient.birth}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gi�i t�nh:</span>{' '}
                  <span className="font-medium">
                    {selectedPatient.gender === 'NAM' ? 'Nam' : 'N�'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Selection */}
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khoa kh�m *</FormLabel>
                  <Select
                    onValueChange={handleDepartmentChange}
                    value={field.value?.toString() || ''}
                    disabled={isFormDisabled || isDepartmentsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ch�n khoa kh�m" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Doctor Selection */}
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>B�c s) *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString() || ''}
                    disabled={isFormDisabled || !selectedDepartment || isDoctorsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ch�n b�c s)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name}
                          {doctor.position && ` - ${doctor.position}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Appointment Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ng�y kh�m *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                          disabled={isFormDisabled}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'dd/MM/yyyy')
                          ) : (
                            <span>Ch�n ng�y</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, 'yyyy-MM-dd'))
                          }
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Appointment Time */}
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gi� kh�m *</FormLabel>
                  <FormControl>
                    <TimePicker
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isFormDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Symptoms */}
          <FormField
            control={form.control}
            name="symptoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tri�u ch�ng</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="M� t� tri�u ch�ng ho�c l� do kh�m..."
                    className="resize-none"
                    rows={4}
                    disabled={isFormDisabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isFormDisabled}
              >
                H�y
              </Button>
            )}
            <Button type="submit" disabled={isFormDisabled}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              �t l�ch kh�m
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
