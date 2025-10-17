import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ImageUpload } from './image-upload'
import { Upload } from 'lucide-react'

interface LabResultImageUploadDialogProps {
    onImagesChange: (files: File[]) => void
    currentImages?: File[]
}

export function LabResultImageUploadDialog({
    onImagesChange,
    currentImages = []
}: LabResultImageUploadDialogProps) {
    const [open, setOpen] = useState(false)
    const [images, setImages] = useState<File[]>(currentImages)

    const handleSave = () => {
        onImagesChange(images)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type='button' variant='outline' size='sm'>
                    <Upload className='mr-2 h-4 w-4' />
                    Tải ảnh kết quả ({currentImages.length})
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
                        >
                            Hủy
                        </Button>
                        <Button
                            type='button'
                            onClick={handleSave}
                        >
                            Lưu ảnh
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
