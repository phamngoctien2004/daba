import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { toast } from 'sonner'
import type { Department } from '../api/departments-filter'

const formSchema = z.object({
    roomNumber: z.string().min(1, 'Mã phòng là bắt buộc'),
    roomName: z.string().min(1, 'Tên phòng là bắt buộc'),
    departmentId: z.string().min(1, 'Vui lòng chọn khoa'),
})

type FormValues = z.infer<typeof formSchema>

type CreateRoomDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    departments: Department[]
}

export function CreateRoomDialog({
    open,
    onOpenChange,
    departments,
}: CreateRoomDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            roomNumber: '',
            roomName: '',
            departmentId: '',
        },
    })

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true)
        try {
            console.log('Create room:', values)

            // TODO: API chưa có - giả lập delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast.info('API tạo phòng chưa được triển khai')
            form.reset()
            onOpenChange(false)
        } catch (error) {
            toast.error('Có lỗi xảy ra')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle>Thêm phòng khám mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin phòng khám mới
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <FormField
                            control={form.control}
                            name='roomNumber'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mã phòng *</FormLabel>
                                    <FormControl>
                                        <Input placeholder='101A' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='roomName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên phòng *</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Phòng khám Nội tổng quát' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='departmentId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Khoa *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
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

                        <div className='rounded-lg bg-muted/50 p-4'>
                            <p className='text-sm text-muted-foreground'>
                                💡 API tạo phòng chưa được triển khai. Form này chỉ hiển thị giao diện.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => onOpenChange(false)}
                            >
                                Hủy
                            </Button>
                            <Button type='submit' disabled={isSubmitting}>
                                {isSubmitting ? 'Đang tạo...' : 'Tạo phòng'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
