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
import { useCreateDepartment } from '../hooks/use-departments-crud'

const formSchema = z.object({
    name: z.string().min(1, 'Tên khoa là bắt buộc'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ').max(11, 'Số điện thoại không hợp lệ'),
    description: z.string().min(1, 'Mô tả là bắt buộc'),
})

type FormValues = z.infer<typeof formSchema>

type CreateDepartmentDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateDepartmentDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateDepartmentDialogProps) {
    const { mutate: createMutation, isPending } = useCreateDepartment(onSuccess)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            phone: '',
            description: '',
        },
    })

    const onSubmit = async (values: FormValues) => {
        createMutation(values, {
            onSuccess: () => {
                form.reset()
                onOpenChange(false)
            },
        })
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
                                {isPending ? 'Đang tạo...' : 'Tạo khoa'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
