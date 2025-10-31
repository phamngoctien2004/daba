import { useState, useEffect } from 'react'
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
import type { Department } from '../api/departments-list'

const formSchema = z.object({
    name: z.string().min(1, 'Tên khoa là bắt buộc'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
    description: z.string().min(1, 'Mô tả là bắt buộc'),
})

type FormValues = z.infer<typeof formSchema>

type EditDepartmentDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    department: Department | null
}

export function EditDepartmentDialog({
    open,
    onOpenChange,
    department,
}: EditDepartmentDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            phone: '',
            description: '',
        },
    })

    // Reset form when department changes
    useEffect(() => {
        if (department) {
            form.reset({
                name: department.name,
                phone: department.phone,
                description: department.description,
            })
        }
    }, [department, form])

    const onSubmit = async (values: FormValues) => {
        if (!department) return

        setIsSubmitting(true)
        try {
            console.log('Update department:', department.id, values)

            // TODO: API chưa có - giả lập delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast.info('API cập nhật khoa chưa được triển khai')
            onOpenChange(false)
        } catch (error) {
            toast.error('Có lỗi xảy ra')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!department) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa khoa</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin khoa #{department.id} - {department.name}
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
                                💡 API cập nhật khoa chưa được triển khai. Form này chỉ hiển thị giao diện.
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
                                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
