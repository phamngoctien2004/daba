import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useCreateLeave } from '../hooks/use-leaves'
import type { ShiftType } from '../types'

const SHIFTS: { value: ShiftType; label: string }[] = [
    { value: 'SANG', label: 'Ca sáng (7:00 - 12:00)' },
    { value: 'CHIEU', label: 'Ca chiều (12:00 - 17:00)' },
    { value: 'TOI', label: 'Ca tối (17:00 - 22:00)' },
]

const leaveSchema = z.object({
    day: z.date({ message: 'Vui lòng chọn ngày nghỉ' }),
    shifts: z.array(z.enum(['SANG', 'CHIEU', 'TOI'])).min(1, 'Vui lòng chọn ít nhất 1 ca nghỉ'),
    reason: z.string().min(1, 'Vui lòng nhập lý do nghỉ').max(500, 'Lý do không quá 500 ký tự'),
})

type LeaveFormValues = z.infer<typeof leaveSchema>

interface CreateLeaveDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateLeaveDialog({ open, onOpenChange }: CreateLeaveDialogProps) {
    const { mutate: createLeave, isPending } = useCreateLeave()

    const form = useForm<LeaveFormValues>({
        resolver: zodResolver(leaveSchema),
        defaultValues: {
            shifts: [],
            reason: '',
        },
    })

    const onSubmit = (values: LeaveFormValues) => {
        createLeave(
            {
                day: format(values.day, 'yyyy-MM-dd'),
                shifts: values.shifts,
                reason: values.reason,
            },
            {
                onSuccess: () => {
                    form.reset()
                    onOpenChange(false)
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Đăng ký nghỉ phép</DialogTitle>
                    <DialogDescription>
                        Điền thông tin đơn xin nghỉ phép. Đơn sẽ được gửi đến quản lý để phê duyệt.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Ngày nghỉ */}
                        <FormField
                            control={form.control}
                            name="day"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>
                                        Ngày nghỉ <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, 'PPP', { locale: vi })
                                                    ) : (
                                                        <span>Chọn ngày nghỉ</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Chọn ca nghỉ */}
                        <FormField
                            control={form.control}
                            name="shifts"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel>
                                            Ca nghỉ <span className="text-destructive">*</span>
                                        </FormLabel>
                                    </div>
                                    <div className="space-y-3">
                                        {SHIFTS.map((shift) => (
                                            <FormField
                                                key={shift.value}
                                                control={form.control}
                                                name="shifts"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={shift.value}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(shift.value)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, shift.value])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== shift.value
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {shift.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Lý do nghỉ <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nhập lý do nghỉ phép..."
                                            className="min-h-[100px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Đang gửi...' : 'Gửi đơn'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
