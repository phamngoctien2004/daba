/**
 * Delete Service Dialog
 * Xác nhận xóa dịch vụ
 */

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { useDeleteService } from '../hooks/use-services-crud'

interface DeleteServiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    serviceId: number | null
    serviceName: string
}

export function DeleteServiceDialog({
    open,
    onOpenChange,
    serviceId,
    serviceName,
}: DeleteServiceDialogProps) {
    const { mutate: deleteMutation, isPending } = useDeleteService()

    const handleDelete = () => {
        if (!serviceId) return
        deleteMutation(serviceId, {
            onSuccess: () => {
                onOpenChange(false)
            },
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa dịch vụ <strong>"{serviceName}"</strong>? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isPending} className='bg-destructive hover:bg-destructive/90'>
                        {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Xóa
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
