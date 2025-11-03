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
import { useResetUserPassword } from '../hooks/use-users-crud'

const formSchema = z.object({
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
})

type FormValues = z.infer<typeof formSchema>

type ResetPasswordDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    userId: number | null
    userName: string
}

export function ResetPasswordDialog({
    open,
    onOpenChange,
    userId,
    userName,
}: ResetPasswordDialogProps) {
    const { mutate: resetPasswordMutation, isPending } = useResetUserPassword()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (values: FormValues) => {
        if (!userId) return

        // Không gửi confirmPassword cho BE, chỉ dùng để validate
        resetPasswordMutation(
            {
                id: userId,
                password: values.password,
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
            <DialogContent className='sm:max-w-[450px]'>
                <DialogHeader>
                    <DialogTitle>Thiết lập mật khẩu</DialogTitle>
                    <DialogDescription>
                        Đặt mật khẩu mới cho người dùng: <strong>{userName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        {/* Password */}
                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu mới *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='password'
                                            placeholder='Nhập mật khẩu mới'
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
                                {isPending ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
