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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const formSchema = z.object({
    name: z.string().min(1, 'Tên khoa là bắt buộc'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
    description: z.string().min(1, 'Mô tả là bắt buộc'),
})

type FormValues = z.infer<typeof formSchema>

type CreateDepartmentDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateDepartmentDialog({
    open,
    onOpenChange,
}: CreateDepartmentDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            phone: '',
            description: '',
        },
    })

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true)
        try {
            console.log('Create department:', values)

            // TODO: API chưa có - giả lập delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast.info('API tạo khoa chưa được triển khai')
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
                    <DialogTitle>Thêm khoa mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin khoa khám bệnh mới
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên khoa *</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Khoa Nội tổng hợp' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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

                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Khám và điều trị các bệnh lý...'
                                            className='min-h-[100px]'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='rounded-lg bg-muted/50 p-4'>
                            <p className='text-sm text-muted-foreground'>
                                💡 API tạo khoa chưa được triển khai. Form này chỉ hiển thị giao diện.
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
                                {isSubmitting ? 'Đang tạo...' : 'Tạo khoa'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
