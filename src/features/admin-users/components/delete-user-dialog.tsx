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
import { useDeleteUser } from '../hooks/use-users-crud'

type DeleteUserDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    userId: number | null
    userName?: string
}

export function DeleteUserDialog({
    open,
    onOpenChange,
    userId,
    userName,
}: DeleteUserDialogProps) {
    const { mutate: deleteMutation, isPending } = useDeleteUser()

    const handleDelete = () => {
        if (!userId) return

        deleteMutation(userId, {
            onSuccess: () => {
                onOpenChange(false)
            },
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa người dùng{' '}
                        <span className='font-semibold'>{userName || `#${userId}`}</span>?
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
