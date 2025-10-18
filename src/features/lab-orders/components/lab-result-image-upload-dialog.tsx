import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from './image-upload'
import { uploadLabResultImages } from '../api/lab-orders'

const LAB_RESULT_IMAGES_STORAGE_KEY = 'lab_result_images_urls'

interface LabResultImageUploadDialogProps {
    labOrderId: number
}

// Helper functions for localStorage
const saveImageUrlsToStorage = (labOrderId: number, urls: string[]) => {
    const key = `${LAB_RESULT_IMAGES_STORAGE_KEY}_${labOrderId}`
    localStorage.setItem(key, JSON.stringify(urls))
}

export const getImageUrlsFromStorage = (labOrderId: number): string[] => {
    const key = `${LAB_RESULT_IMAGES_STORAGE_KEY}_${labOrderId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
}

export const clearImageUrlsFromStorage = (labOrderId: number) => {
    const key = `${LAB_RESULT_IMAGES_STORAGE_KEY}_${labOrderId}`
    localStorage.removeItem(key)
}

export function LabResultImageUploadDialog({
    labOrderId,
}: LabResultImageUploadDialogProps) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [images, setImages] = useState<File[]>([])

    // Get existing URLs from localStorage
    const existingUrls = getImageUrlsFromStorage(labOrderId)

    const uploadMutation = useMutation({
        mutationFn: uploadLabResultImages,
        onSuccess: (urls) => {
            // Save URLs to localStorage
            saveImageUrlsToStorage(labOrderId, urls)

            toast({
                title: 'Thành công',
                description: `Đã tải lên ${urls.length} ảnh`,
            })

            setImages([])
            setOpen(false)
        },
        onError: (error: Error) => {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể tải ảnh lên',
                variant: 'destructive',
            })
        },
    })

    const handleSave = () => {
        if (images.length === 0) {
            toast({
                title: 'Cảnh báo',
                description: 'Vui lòng chọn ít nhất 1 ảnh',
                variant: 'destructive',
            })
            return
        }

        uploadMutation.mutate(images)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type='button' variant='outline' size='sm'>
                    <Upload className='mr-2 h-4 w-4' />
                    Tải ảnh kết quả ({existingUrls.length})
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Tải ảnh kết quả xét nghiệm</DialogTitle>
                    <DialogDescription>
                        Tải lên các ảnh kết quả xét nghiệm (tối đa 10 ảnh)
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4'>
                    {existingUrls.length > 0 && (
                        <div className='rounded-lg bg-muted/50 p-4'>
                            <p className='text-sm font-medium mb-2'>Đã tải lên: {existingUrls.length} ảnh</p>
                            <p className='text-xs text-muted-foreground'>
                                Các ảnh đã tải lên sẽ được gửi khi bấm "Hoàn thành xét nghiệm"
                            </p>
                        </div>
                    )}

                    <ImageUpload
                        value={images}
                        onChange={setImages}
                        maxFiles={10}
                    />

                    <div className='flex justify-end gap-3'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => setOpen(false)}
                            disabled={uploadMutation.isPending}
                        >
                            Hủy
                        </Button>
                        <Button
                            type='button'
                            onClick={handleSave}
                            disabled={uploadMutation.isPending}
                        >
                            {uploadMutation.isPending && (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            Lưu ảnh
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
