import { useCallback, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
    value: File[]
    onChange: (files: File[]) => void
    maxFiles?: number
    className?: string
}

export function ImageUpload({
    value = [],
    onChange,
    maxFiles = 10,
    className,
}: ImageUploadProps) {
    const [previews, setPreviews] = useState<string[]>([])

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || [])
            const remainingSlots = maxFiles - value.length

            if (files.length > remainingSlots) {
                alert(`Chỉ có thể tải lên tối đa ${maxFiles} ảnh`)
                return
            }

            const imageFiles = files.filter((file) => file.type.startsWith('image/'))

            if (imageFiles.length !== files.length) {
                alert('Chỉ chấp nhận file ảnh')
                return
            }

            // Create previews
            const newPreviews: string[] = []
            imageFiles.forEach((file) => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string)
                    if (newPreviews.length === imageFiles.length) {
                        setPreviews((prev) => [...prev, ...newPreviews])
                    }
                }
                reader.readAsDataURL(file)
            })

            onChange([...value, ...imageFiles])
        },
        [value, onChange, maxFiles]
    )

    const handleRemove = useCallback(
        (index: number) => {
            const newFiles = value.filter((_, i) => i !== index)
            const newPreviews = previews.filter((_, i) => i !== index)
            onChange(newFiles)
            setPreviews(newPreviews)
        },
        [value, previews, onChange]
    )

    return (
        <div className={cn('space-y-4', className)}>
            <div className='flex items-center gap-2'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => document.getElementById('image-upload-input')?.click()}
                    disabled={value.length >= maxFiles}
                    className='gap-2'
                >
                    <Upload className='h-4 w-4' />
                    Tải ảnh lên
                </Button>
                <span className='text-sm text-muted-foreground'>
                    {value.length}/{maxFiles} ảnh
                </span>
            </div>

            <input
                id='image-upload-input'
                type='file'
                accept='image/*'
                multiple
                onChange={handleFileChange}
                className='hidden'
            />

            {previews.length > 0 && (
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
                    {previews.map((preview, index) => (
                        <div
                            key={index}
                            className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'
                        >
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className='h-full w-full object-cover'
                            />
                            <Button
                                type='button'
                                variant='destructive'
                                size='icon'
                                className='absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
                                onClick={() => handleRemove(index)}
                            >
                                <X className='h-4 w-4' />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {previews.length === 0 && (
                <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center'>
                    <ImageIcon className='mb-4 h-12 w-12 text-muted-foreground' />
                    <p className='text-sm text-muted-foreground'>
                        Chưa có ảnh nào được tải lên
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                        Click nút "Tải ảnh lên" để thêm ảnh kết quả xét nghiệm
                    </p>
                </div>
            )}
        </div>
    )
}
