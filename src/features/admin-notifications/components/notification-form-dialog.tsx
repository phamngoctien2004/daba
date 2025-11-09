/**
 * Notification Form Dialog
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Upload, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { useCreateNotification, useUpdateNotification, useUploadFile } from '../hooks/use-notifications'
import type { Notification } from '../types'

const formSchema = z.object({
    title: z.string().min(1, 'Tiêu đề là bắt buộc'),
    content: z.string().min(1, 'Nội dung là bắt buộc'),
    image: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface NotificationFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    notification?: Notification | null
}

export function NotificationFormDialog({
    open,
    onOpenChange,
    notification
}: NotificationFormDialogProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)

    const isEdit = !!notification

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            content: '',
            image: '',
        },
    })

    const { mutate: createMutation, isPending: isCreating } = useCreateNotification()
    const { mutate: updateMutation, isPending: isUpdating } = useUpdateNotification()
    const { mutateAsync: uploadMutation } = useUploadFile()

    useEffect(() => {
        if (notification) {
            form.reset({
                title: notification.title,
                content: notification.content,
                image: notification.image || '',
            })
            setImagePreview(notification.image || null)
        } else {
            form.reset({
                title: '',
                content: '',
                image: '',
            })
            setImagePreview(null)
        }
    }, [notification, form])

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploadingImage(true)
        try {
            const imageUrl = await uploadMutation({ file, type: 'notification' })
            form.setValue('image', imageUrl)
            setImagePreview(imageUrl)
        } catch (error) {
            console.error('Upload failed:', error)
        } finally {
            setUploadingImage(false)
        }
    }

    const handleRemoveImage = () => {
        form.setValue('image', '')
        setImagePreview(null)
    }

    const onSubmit = (values: FormValues) => {
        if (isEdit && notification) {
            updateMutation(
                {
                    id: notification.id,
                    title: values.title,
                    content: values.content,
                    image: values.image,
                },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        form.reset()
                        setImagePreview(null)
                    },
                }
            )
        } else {
            createMutation(
                {
                    title: values.title,
                    content: values.content,
                    image: values.image,
                },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        form.reset()
                        setImagePreview(null)
                    },
                }
            )
        }
    }

    const isPending = isCreating || isUpdating

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[600px]'>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Cập nhật thông tin thông báo'
                            : 'Điền thông tin để tạo thông báo mới'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='title'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tiêu đề</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Nhập tiêu đề thông báo' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='content'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nội dung</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Nhập nội dung thông báo'
                                            rows={5}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='image'
                            render={() => (
                                <FormItem>
                                    <FormLabel>Hình ảnh (tuỳ chọn)</FormLabel>
                                    <FormControl>
                                        <div className='space-y-3'>
                                            {imagePreview ? (
                                                <div className='relative'>
                                                    <img
                                                        src={imagePreview}
                                                        alt='Preview'
                                                        className='h-40 w-full rounded-lg object-cover'
                                                    />
                                                    <Button
                                                        type='button'
                                                        variant='destructive'
                                                        size='sm'
                                                        className='absolute right-2 top-2'
                                                        onClick={handleRemoveImage}
                                                    >
                                                        <X className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className='flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8'>
                                                    <div className='text-center'>
                                                        <Upload className='mx-auto h-8 w-8 text-muted-foreground' />
                                                        <div className='mt-2 text-sm text-muted-foreground'>
                                                            {uploadingImage ? 'Đang tải lên...' : 'Tải lên hình ảnh'}
                                                        </div>
                                                        <Input
                                                            type='file'
                                                            accept='image/*'
                                                            className='mt-2'
                                                            onChange={handleImageUpload}
                                                            disabled={uploadingImage}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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
                                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                {isEdit ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
