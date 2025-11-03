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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useUserDetail, useUpdateUser } from '../hooks/use-users-crud'
import type { UpdateUserRequest } from '../types-crud'

const formSchema = z.object({
    name: z.string().min(1, 'Tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ').max(11, 'Số điện thoại không hợp lệ'),
    role: z.enum(['BAC_SI', 'LE_TAN', 'BENH_NHAN', 'ADMIN'], {
        message: 'Vai trò là bắt buộc',
    }),
})

type FormValues = z.infer<typeof formSchema>

type EditUserDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    userId: number | null
}

export function EditUserDialog({
    open,
    onOpenChange,
    userId,
}: EditUserDialogProps) {
    const { data: user, isLoading } = useUserDetail(userId, open)
    const { mutate: updateMutation, isPending } = useUpdateUser()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            role: 'BENH_NHAN',
        },
    })

    useEffect(() => {
        if (user && open) {
            console.log('🔵 [EditUserDialog] Filling form with user data:', user)
            form.reset({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'BENH_NHAN',
            })
        } else if (!open) {
            form.reset({
                name: '',
                email: '',
                phone: '',
                role: 'BENH_NHAN',
            })
        }
    }, [user, open, form.reset])

    const onSubmit = async (values: FormValues) => {
        if (!userId) return

        const updateData: UpdateUserRequest = {
            id: userId,
            name: values.name,
            email: values.email,
            phone: values.phone,
            role: values.role,
        }

        updateMutation(updateData, {
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
                    <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
                    <DialogDescription>
                        {user ? `Cập nhật thông tin người dùng #${user.id} - ${user.name}` : 'Đang tải...'}
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
                                                <Input type='email' placeholder='email@example.com' {...field} />
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

                                {/* Role */}
                                <FormField
                                    control={form.control}
                                    name='role'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vai trò *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
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
