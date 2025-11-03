import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useUpdateRoom, useRoomDetail } from '../hooks/use-rooms-crud'
import type { Department } from '../api/departments-filter'

const formSchema = z.object({
    roomNumber: z.string().min(1, 'Mã phòng là bắt buộc'),
    roomName: z.string().min(1, 'Tên phòng là bắt buộc'),
    departmentId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type EditRoomDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    roomId: number | null
    departments: Department[]
    isDepartmentsLoading?: boolean
}

export function EditRoomDialog({
    open,
    onOpenChange,
    roomId,
    departments,
    isDepartmentsLoading = false,
}: EditRoomDialogProps) {
    // Only fetch room detail AFTER departments have loaded successfully
    // Must check both loading state AND that departments array is populated
    const canFetchRoom = open && !isDepartmentsLoading && departments.length > 0
    const { data: room, isLoading } = useRoomDetail(roomId, canFetchRoom)

    console.log('🔵 [EditRoomDialog] Render:', {
        open,
        roomId,
        hasRoom: !!room,
        roomData: room,
        isLoading,
        isDepartmentsLoading,
        departmentsCount: departments.length,
        canFetchRoom,
        departmentsList: departments,
    })

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            roomNumber: '',
            roomName: '',
            departmentId: '',
        },
    })

    const { mutate, isPending } = useUpdateRoom(() => {
        onOpenChange(false)
    })

    // Reset form to empty when dialog closes
    useEffect(() => {
        if (!open) {
            console.log('🔵 [EditRoomDialog] Dialog closed, clearing form')
            form.reset({
                roomNumber: '',
                roomName: '',
                departmentId: '',
            })
        }
    }, [open, form])

    // Reset form when room data loads (departments already guaranteed to be ready)
    useEffect(() => {
        // CRITICAL: Only fill form when BOTH conditions are met:
        // 1. Room data is available
        // 2. Departments array is populated (to ensure Select has options)
        if (open && room && departments.length > 0) {
            console.log('🔵 [EditRoomDialog] Filling form with room data:', {
                roomId: room.roomId,
                roomNumber: room.roomNumber,
                roomName: room.roomName,
                departmentId: room.departmentId,
                departmentIdType: typeof room.departmentId,
                departmentIdValue: room.departmentId === null ? 'NULL' : room.departmentId,
                availableDepartments: departments.map(d => d.id),
            })

            // Use setValue instead of reset to ensure values are updated
            form.setValue('roomNumber', room.roomNumber)
            form.setValue('roomName', room.roomName)

            const deptValue = room.departmentId ? room.departmentId.toString() : ''
            console.log('🔵 [EditRoomDialog] Setting departmentId to:', deptValue)
            form.setValue('departmentId', deptValue)

            console.log('🔵 [EditRoomDialog] Form values after set:', form.getValues())
        } else {
            console.log('🔵 [EditRoomDialog] Not filling form yet:', {
                open,
                hasRoom: !!room,
                departmentsCount: departments.length,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, room, departments.length])

    const onSubmit = (values: FormValues) => {
        if (!roomId) return

        mutate({
            roomId,
            roomNumber: values.roomNumber,
            roomName: values.roomName,
            departmentId: values.departmentId ? Number(values.departmentId) : null,
        })
    }

    // Show loading state if room is loading OR departments not loaded yet
    const isFormLoading = isLoading || isDepartmentsLoading || departments.length === 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl' key={roomId}>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa phòng khám</DialogTitle>
                    <DialogDescription>
                        {room ? `Cập nhật thông tin phòng #{room.roomId} - ${room.roomName}` : 'Đang tải...'}
                    </DialogDescription>
                </DialogHeader>

                {isFormLoading ? (
                    <div className='space-y-4'>
                        <Skeleton className='h-10 w-full' />
                        <Skeleton className='h-10 w-full' />
                        <Skeleton className='h-10 w-full' />
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                            <FormField
                                control={form.control}
                                name='roomNumber'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mã phòng *</FormLabel>
                                        <FormControl>
                                            <Input placeholder='101A' {...field} />
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
                                        <FormLabel>Tên phòng *</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Phòng khám Nội tổng quát' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='departmentId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Khoa (tùy chọn)</FormLabel>
                                        <Select
                                            key={field.value || 'no-dept'}
                                            onValueChange={(value) => {
                                                field.onChange(value === '_none' ? '' : value)
                                            }}
                                            value={field.value || '_none'}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Chọn khoa' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='_none'>Không chọn khoa</SelectItem>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                    {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}