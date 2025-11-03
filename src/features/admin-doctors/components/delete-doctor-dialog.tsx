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
import { useDeleteDoctor } from '../hooks/use-doctors'
import type { DoctorDetail } from '../types'

type DeleteDoctorDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    doctor: DoctorDetail | null
}

export function DeleteDoctorDialog({
    open,
    onOpenChange,
    doctor,
}: DeleteDoctorDialogProps) {
    const { mutate: deleteMutation, isPending } = useDeleteDoctor()

    const handleDelete = () => {
        if (!doctor) return

        deleteMutation(doctor.id, {
            onSuccess: () => {
                onOpenChange(false)
            },
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa bác sĩ</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa bác sĩ <strong>{doctor?.fullName}</strong> không?
                        <br />
                        <br />
                        Hành động này không thể hoàn tác và sẽ xóa toàn bộ thông tin liên quan đến bác sĩ này.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                        {isPending ? 'Đang xóa...' : 'Xóa'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
