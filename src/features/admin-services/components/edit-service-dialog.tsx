import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { updateService } from '../api/services'
import type { Service } from '../types'

interface EditServiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    service: Service | null
}

const serviceFormSchema = z.object({
    code: z.string().min(1, 'Mã dịch vụ là bắt buộc'),
    name: z.string().min(1, 'Tên dịch vụ là bắt buộc'),
    price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
    description: z.string().optional().nullable(),
    roomNumber: z.string().min(1, 'Số phòng là bắt buộc'),
    roomName: z.string().min(1, 'Tên phòng là bắt buộc'),
    type: z.enum(['KHAC', 'DICH_VU', 'XET_NGHIEM']),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

export function EditServiceDialog({
    open,
    onOpenChange,
    service,
}: EditServiceDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: {
            code: '',
            name: '',
            price: 0,
            description: '',
            roomNumber: '',
            roomName: '',
            type: 'DICH_VU',
        },
    })

    // Update form when service changes
    useEffect(() => {
        if (service) {
            form.reset({
                code: service.code,
                name: service.name,
                price: service.price,
                description: service.description || '',
                roomNumber: service.roomNumber,
                roomName: service.roomName,
                type: service.type,
            })
        }
    }, [service, form])

    const updateMutation = useMutation({
        mutationFn: updateService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-services'] })
            toast.success('Đã cập nhật dịch vụ')
            onOpenChange(false)
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể cập nhật dịch vụ')
        },
        onSettled: () => {
            setIsSubmitting(false)
        },
    })

    const onSubmit = async (values: ServiceFormValues) => {
        if (!service) return

        setIsSubmitting(true)
        updateMutation.mutate({
            id: service.id,
            ...values,
            description: values.description || null,
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa dịch vụ khám</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin dịch vụ khám
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={form.control}
                                name='code'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Mã dịch vụ <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder='VD: KB001' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='type'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Loại dịch vụ <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Chọn loại' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='KHAC'>Khác</SelectItem>
                                                <SelectItem value='DICH_VU'>Dịch vụ</SelectItem>
                                                <SelectItem value='XET_NGHIEM'>Xét nghiệm</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Tên dịch vụ <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder='VD: Khám bệnh tổng quát' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='price'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Giá (VND) <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            placeholder='0'
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={form.control}
                                name='roomNumber'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Số phòng <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder='VD: 101A' {...field} />
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
                                        <FormLabel>
                                            Tên phòng <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder='VD: Phòng khám Nội' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Nhập mô tả chi tiết về dịch vụ...'
                                            className='min-h-[100px]'
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='flex justify-end gap-2 pt-4'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </Button>
                            <Button type='submit' disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                Cập nhật
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

