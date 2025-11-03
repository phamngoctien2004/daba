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
import { useDeleteDepartment } from '../hooks/use-departments-crud'

type DeleteDepartmentDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    departmentId: number | null
    departmentName?: string
}

export function DeleteDepartmentDialog({
    open,
    onOpenChange,
    departmentId,
    departmentName,
}: DeleteDepartmentDialogProps) {
    const { mutate: deleteMutation, isPending } = useDeleteDepartment()

    const handleDelete = () => {
        if (!departmentId) return

        deleteMutation(departmentId, {
            onSuccess: () => {
                onOpenChange(false)
            },
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa khoa</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa khoa{' '}
                        <span className='font-semibold'>{departmentName || `#${departmentId}`}</span>?
                        <br />
                        <br />
                        Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className='bg-destructive hover:bg-destructive/90'
                    >
                        {isPending ? 'Đang xóa...' : 'Xóa'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
