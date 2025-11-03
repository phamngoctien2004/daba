import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
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
import { useCreateRoom } from '../hooks/use-rooms-crud'
import type { Department } from '../api/departments-filter'

const formSchema = z.object({
    roomNumber: z.string().min(1, 'Mã phòng là bắt buộc'),
    roomName: z.string().min(1, 'Tên phòng là bắt buộc'),
    departmentId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type CreateRoomDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    departments: Department[]
    isDepartmentsLoading?: boolean
}

export function CreateRoomDialog({
    open,
    onOpenChange,
    departments,
    isDepartmentsLoading = false,
}: CreateRoomDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            roomNumber: '',
            roomName: '',
            departmentId: '',
        },
    })

    const { mutate, isPending } = useCreateRoom(() => {
        form.reset()
        onOpenChange(false)
    })

    const onSubmit = (values: FormValues) => {
        mutate({
            roomNumber: values.roomNumber,
            roomName: values.roomName,
            departmentId: values.departmentId ? Number(values.departmentId) : null,
        })
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
                                        disabled={isDepartmentsLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isDepartmentsLoading ? 'Đang tải danh sách khoa...' : 'Chọn khoa'} />
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
                                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                {isPending ? 'Đang tạo...' : 'Tạo phòng'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
