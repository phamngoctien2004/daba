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
import { useCreateUser } from '../hooks/use-users-crud'

const formSchema = z.object({
    name: z.string().min(1, 'Tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ').max(11, 'Số điện thoại không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    role: z.enum(['BAC_SI', 'LE_TAN', 'BENH_NHAN', 'ADMIN'], {
        message: 'Vai trò là bắt buộc',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
})

type FormValues = z.infer<typeof formSchema>

type CreateUserDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateUserDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateUserDialogProps) {
    const { mutate: createMutation, isPending } = useCreateUser(onSuccess)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            role: 'BENH_NHAN',
        },
    })

    const onSubmit = async (values: FormValues) => {
        // Không gửi confirmPassword cho BE, chỉ dùng để validate
        const { confirmPassword, ...userData } = values
        createMutation(userData, {
            onSuccess: () => {
                form.reset()
                onOpenChange(false)
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle>Tạo tài khoản mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin để tạo tài khoản mới
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {/* Name */}
                            <FormField
                                control={form.control}
                                name='name'
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
                                            <Input
                                                type='email'
                                                placeholder='email@example.com'
                                                {...field}
                                            />
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

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='password'
                                                placeholder='Nhập mật khẩu'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Confirm Password */}
                            <FormField
                                control={form.control}
                                name='confirmPassword'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Xác nhận mật khẩu *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='password'
                                                placeholder='Nhập lại mật khẩu'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Role */}
                            <FormField
                                control={form.control}
                                name='role'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vai trò *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Chọn vai trò' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='BENH_NHAN'>Bệnh nhân</SelectItem>
                                                <SelectItem value='BAC_SI'>Bác sĩ</SelectItem>
                                                <SelectItem value='LE_TAN'>Lễ tân</SelectItem>
                                                <SelectItem value='ADMIN'>Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                {isPending ? 'Đang thêm...' : 'Thêm người dùng'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
