import { useEffect } from 'react'
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
import { useDepartmentDetail, useUpdateDepartment } from '../hooks/use-departments-crud'

const formSchema = z.object({
    name: z.string().min(1, 'Tên khoa là bắt buộc'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ').max(11, 'Số điện thoại không hợp lệ'),
    description: z.string().min(1, 'Mô tả là bắt buộc'),
})

type FormValues = z.infer<typeof formSchema>

type EditDepartmentDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    departmentId: number | null
}

export function EditDepartmentDialog({
    open,
    onOpenChange,
    departmentId,
}: EditDepartmentDialogProps) {
    const { data: department, isLoading } = useDepartmentDetail(departmentId, open)
    const { mutate: updateMutation, isPending } = useUpdateDepartment()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            phone: '',
            description: '',
        },
    })

    // Reset form when department data is loaded
    useEffect(() => {
        if (department && open) {
            console.log('🔵 [EditDepartmentDialog] Filling form with department data:', department)
            form.reset({
                name: department.name || '',
                phone: department.phone || '',
                description: department.description || '',
            })
        } else if (!open) {
            form.reset({
                name: '',
                phone: '',
                description: '',
            })
        }
    }, [department, open, form.reset])

    const onSubmit = async (values: FormValues) => {
        if (!departmentId) return

        updateMutation(
            {
                id: departmentId,
                ...values,
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
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa khoa</DialogTitle>
                    <DialogDescription>
                        {department ? `Cập nhật thông tin khoa #${department.id} - ${department.name}` : 'Đang tải...'}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='flex items-center justify-center py-8'>
                        <div className='text-center'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                            <p className='mt-2 text-sm text-muted-foreground'>Đang tải thông tin...</p>
                        </div>
                    </div>
                ) : (
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
