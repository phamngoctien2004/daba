import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageModalProps {
    imageUrl: string | null
    onClose: () => void
}

export function ImageModal({ imageUrl, onClose }: ImageModalProps) {
    if (!imageUrl) return null

    return (
        <div
            className='fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm'
            onClick={onClose}
        >
            {/* Close button */}
            <Button
                size='icon'
                variant='ghost'
                className='absolute top-4 right-4 text-white hover:bg-white/20'
                onClick={onClose}
            >
                <X size={24} />
            </Button>

            {/* Image container */}
            <div
                className='relative max-h-[90vh] max-w-[90vw] flex items-center justify-center'
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt='Full size'
                    className={cn(
                        'max-h-[90vh] max-w-[90vw] object-contain rounded-lg',
                        'shadow-2xl'
                    )}
                />
            </div>

            {/* Click outside hint */}
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm'>
                Click bên ngoài để đóng
            </div>
        </div>
    )
}
