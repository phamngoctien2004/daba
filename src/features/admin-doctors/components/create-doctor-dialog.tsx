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
import { useCreateDoctor } from '../hooks/use-doctors'
import { fetchDegrees } from '../api/degrees'
import { fetchDepartments } from '../api/departments'

const formSchema = z.object({
    fullName: z.string().min(1, 'Họ tên là bắt buộc'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ').max(11, 'Số điện thoại không hợp lệ'),
    address: z.string().min(1, 'Địa chỉ là bắt buộc'),
    birth: z.date({ message: 'Ngày sinh là bắt buộc' }),
    gender: z.enum(['NAM', 'NU'], { message: 'Giới tính là bắt buộc' }),
    departmentId: z.number({ message: 'Khoa là bắt buộc' }),
    degreeId: z.number({ message: 'Bằng cấp là bắt buộc' }),
    exp: z.number().min(0, 'Số năm kinh nghiệm không hợp lệ'),
    email: z.string().email('Email không hợp lệ'),
})

type FormValues = z.infer<typeof formSchema>

type CreateDoctorDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateDoctorDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateDoctorDialogProps) {
    const { mutate: createMutation, isPending } = useCreateDoctor(onSuccess)
    const [calendarOpen, setCalendarOpen] = useState(false)

    // Fetch degrees and departments
    const { data: degrees = [] } = useQuery({
        queryKey: ['degrees'],
        queryFn: fetchDegrees,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: fetchDepartments,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            address: '',
            gender: 'NAM',
            exp: 0,
            email: '',
        },
    })

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            form.reset()
        }
    }, [open, form])

    const onSubmit = async (values: FormValues) => {
        const requestData = {
            ...values,
            birth: format(values.birth, 'yyyy-MM-dd'),
        }

        createMutation(requestData, {
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
                    <DialogTitle>Thêm bác sĩ mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin bác sĩ mới vào hệ thống
                    </DialogDescription>
                </DialogHeader>

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

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <Input type='email' placeholder='doctor@hospital.com' {...field} />
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                            value={field.value?.toString()}
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
                                            value={field.value?.toString()}
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
                                {isPending ? 'Đang thêm...' : 'Thêm bác sĩ'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
