import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useUpdateDoctor } from '../hooks/use-doctors'
import { fetchDoctorById } from '../api/doctors'
import { fetchDegrees } from '../api/degrees'
import { fetchDepartments } from '../api/departments'
import type { DoctorDetail } from '../types'

const formSchema = z.object({
    fullName: z.string().min(1, 'Họ tên là bắt buộc'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ').max(11, 'Số điện thoại không hợp lệ'),
    address: z.string().min(1, 'Địa chỉ là bắt buộc'),
    birth: z.date({ message: 'Ngày sinh là bắt buộc' }),
    gender: z.enum(['NAM', 'NU'], { message: 'Giới tính là bắt buộc' }),
    departmentId: z.number({ message: 'Khoa là bắt buộc' }),
    degreeId: z.number({ message: 'Bằng cấp là bắt buộc' }),
    exp: z.number().min(0, 'Số năm kinh nghiệm không hợp lệ'),
})

type FormValues = z.infer<typeof formSchema>

type EditDoctorDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    doctor: DoctorDetail | null
}

export function EditDoctorDialog({
    open,
    onOpenChange,
    doctor,
}: EditDoctorDialogProps) {
    const { mutate: updateMutation, isPending } = useUpdateDoctor()
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [isFormReady, setIsFormReady] = useState(false)

    // Fetch full doctor details
    const { data: doctorDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['doctor-detail', doctor?.id],
        queryFn: () => fetchDoctorById(doctor!.id),
        enabled: open && !!doctor?.id,
        staleTime: 0, // Always fetch fresh data
    })

    // Fetch degrees and departments when dialog opens
    const { data: degrees = [], isLoading: isLoadingDegrees, isFetched: degreesFetched } = useQuery({
        queryKey: ['degrees'],
        queryFn: fetchDegrees,
        enabled: open, // Only fetch when dialog is open
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const { data: departments = [], isLoading: isLoadingDepartments, isFetched: departmentsFetched } = useQuery({
        queryKey: ['departments'],
        queryFn: fetchDepartments,
        enabled: open, // Only fetch when dialog is open
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            address: '',
            birth: undefined,
            gender: 'NAM',
            departmentId: undefined,
            degreeId: undefined,
            exp: 0,
        },
    })

    // Load doctor data when dialog opens or doctor details are fetched
    // IMPORTANT: Only fill form when ALL data is ready (doctor details, degrees, departments)
    useEffect(() => {
        console.log('🔍 [EditDoctorDialog] useEffect triggered:', {
            open,
            hasDoctorDetails: !!doctorDetails,
            degreesLength: degrees.length,
            departmentsLength: departments.length,
            degreesFetched,
            departmentsFetched,
            isLoadingDegrees,
            isLoadingDepartments,
            isLoadingDetails
        })

        if (!open) {
            console.log('🔄 [EditDoctorDialog] Dialog closed, resetting form')
            setIsFormReady(false)
            form.reset()
            return
        }

        if (doctorDetails && degreesFetched && departmentsFetched && degrees.length > 0 && departments.length > 0) {
            // Parse date from yyyy-MM-dd format
            let birthDate = new Date()
            try {
                if (doctorDetails.birth) {
                    const [year, month, day] = doctorDetails.birth.split('-').map(Number)
                    birthDate = new Date(year, month - 1, day)
                }
            } catch (error) {
                console.error('Error parsing birth date:', error)
            }

            console.log('✅ [EditDoctorDialog] All data ready, setting form values:', {
                departmentId: doctorDetails.departmentResponse?.id,
                degreeId: doctorDetails.degreeResponse?.degreeId,
                degreesLoaded: degrees.length,
                departmentsLoaded: departments.length,
                doctorDetails
            })

            form.reset({
                fullName: doctorDetails.fullName || '',
                phone: doctorDetails.phone || '',
                address: doctorDetails.address || '',
                birth: birthDate,
                gender: doctorDetails.gender || 'NAM',
                departmentId: doctorDetails.departmentResponse?.id || undefined,
                degreeId: doctorDetails.degreeResponse?.degreeId || undefined,
                exp: doctorDetails.exp || 0,
            })

            // Mark form as ready after a small delay to ensure Select components are mounted
            setTimeout(() => {
                setIsFormReady(true)
            }, 100)
        } else if (open) {
            console.log('⏳ [EditDoctorDialog] Waiting for data...')
            setIsFormReady(false)
        }
    }, [open, doctorDetails, degrees, departments, degreesFetched, departmentsFetched, isLoadingDegrees, isLoadingDepartments, isLoadingDetails, form])

    const onSubmit = async (values: FormValues) => {
        if (!doctor) return

        const requestData = {
            id: doctor.id,
            ...values,
            birth: format(values.birth, 'yyyy-MM-dd'),
        }

        updateMutation(requestData, {
            onSuccess: () => {
                form.reset()
                onOpenChange(false)
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa thông tin bác sĩ</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin bác sĩ trong hệ thống
                    </DialogDescription>
                </DialogHeader>

                {isLoadingDetails || isLoadingDegrees || isLoadingDepartments || !isFormReady ? (
                    <div className='flex items-center justify-center py-8'>
                        <div className='text-center'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                            <p className='mt-2 text-sm text-muted-foreground'>Đang tải thông tin...</p>
                        </div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {/* Full Name */}
                                <FormField
                                    control={form.control}
                                    name='fullName'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Họ và tên *</FormLabel>
                                            <FormControl>
                                                <Input placeholder='Nguyễn Văn A' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Phone */}
                                <FormField
                                    control={form.control}
                                    name='phone'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số điện thoại *</FormLabel>
                                            <FormControl>
                                                <Input placeholder='0901234567' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Gender */}
                                <FormField
                                    control={form.control}
                                    name='gender'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giới tính *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
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

                                {/* Birth Date */}
                                <FormField
                                    control={form.control}
                                    name='birth'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-col'>
                                            <FormLabel>Ngày sinh *</FormLabel>
                                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant='outline'
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !field.value && 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, 'dd/MM/yyyy')
                                                            ) : (
                                                                <span>Chọn ngày sinh</span>
                                                            )}
                                                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <Calendar
                                                        mode='single'
                                                        selected={field.value}
                                                        onSelect={(date) => {
                                                            field.onChange(date)
                                                            setCalendarOpen(false)
                                                        }}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date('1900-01-01')
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Department */}
                                <FormField
                                    control={form.control}
                                    name='departmentId'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Khoa *</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value !== undefined && field.value !== null ? field.value.toString() : ''}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Chọn khoa' />
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

                                {/* Degree */}
                                <FormField
                                    control={form.control}
                                    name='degreeId'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bằng cấp *</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value !== undefined && field.value !== null ? field.value.toString() : ''}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Chọn bằng cấp' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {degrees.map((degree) => (
                                                        <SelectItem
                                                            key={degree.degreeId}
                                                            value={degree.degreeId.toString()}
                                                        >
                                                            {degree.degreeName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Experience */}
                                <FormField
                                    control={form.control}
                                    name='exp'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số năm kinh nghiệm *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    placeholder='5'
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Address - Full width */}
                            <FormField
                                control={form.control}
                                name='address'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Địa chỉ *</FormLabel>
                                        <FormControl>
                                            <Input placeholder='123 Nguyễn Trãi, Quận 1, TP.HCM' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <DialogFooter>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => onOpenChange(false)}
                                    disabled={isPending}
                                >
                                    Hủy
                                </Button>
                                <Button type='submit' disabled={isPending}>
                                    {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
