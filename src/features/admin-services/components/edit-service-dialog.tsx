/**
 * Edit Service Dialog
 * Chỉ sửa thông tin cơ bản: name, price, description, roomId
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X, Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUpdateService, useServiceDetail } from '../hooks/use-services-crud'
import { fetchRooms } from '../api/rooms'
import type { UpdateServiceRequest } from '../types'
import type { Room } from '../api/rooms'
import { Skeleton } from '@/components/ui/skeleton'

const editServiceSchema = z.object({
    name: z.string().min(1, 'Tên dịch vụ là bắt buộc'),
    price: z.number().min(0, 'Giá phải >= 0'),
    description: z.string().optional(),
    roomId: z.number().optional(),
})

type FormValues = z.infer<typeof editServiceSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    serviceId: number | null
}

export function EditServiceDialog({ open, onOpenChange, serviceId }: Props) {
    const { data: service, isLoading } = useServiceDetail(serviceId, open)

    const [roomKeyword, setRoomKeyword] = useState('')
    const [roomPopoverOpen, setRoomPopoverOpen] = useState(false)
    const [rooms, setRooms] = useState<Room[]>([])
    const [loadingRooms, setLoadingRooms] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(editServiceSchema),
        defaultValues: {
            name: '',
            price: 0,
            description: '',
            roomId: undefined,
        },
    })

    const { mutate, isPending } = useUpdateService()

    // Fetch rooms when keyword changes
    useEffect(() => {
        if (roomKeyword.trim()) {
            setLoadingRooms(true)
            fetchRooms(roomKeyword)
                .then(setRooms)
                .finally(() => setLoadingRooms(false))
        } else {
            setRooms([])
        }
    }, [roomKeyword])

    // Fill form when service data loads
    useEffect(() => {
        if (service && open) {
            form.reset({
                name: service.name,
                price: service.price,
                description: service.description || '',
                roomId: undefined,
            })

            // Set current room if available
            if (service.roomId && service.roomName) {
                setSelectedRoom({
                    roomId: service.roomId,
                    roomName: service.roomName,
                    roomNumber: service.roomNumber || '',
                    departmentId: null,
                    departmentName: '',
                })
            } else {
                setSelectedRoom(null)
            }

            setRoomKeyword('')
            setRooms([])
        }
    }, [service, open])

    const onSubmit = (values: FormValues) => {
        if (!serviceId) return

        const payload: UpdateServiceRequest = {
            id: serviceId,
            name: values.name,
            price: values.price,
            description: values.description,
            roomId: selectedRoom?.roomId ?? null,
        }

        mutate(payload, {
            onSuccess: () => {
                onOpenChange(false)
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-[1000px] w-full max-h-[90vh] flex flex-col'>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
                    <DialogDescription>Cập nhật thông tin dịch vụ</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='space-y-4'>
                        <Skeleton className='h-10 w-full' />
                        <Skeleton className='h-10 w-full' />
                        <Skeleton className='h-20 w-full' />
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col flex-1 overflow-hidden'>
                            <ScrollArea className='flex-1 pr-4'>
                                <div className='space-y-4 pb-2'>
                                    {/* Name - full width */}
                                    <FormField
                                        control={form.control}
                                        name='name'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tên dịch vụ *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Price - full width or adjust layout */}
                                    <FormField
                                        control={form.control}
                                        name='price'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Giá (VNĐ) *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type='number'
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Current Room Display (Read-only) */}
                                    <div>
                                        <FormLabel>Phòng hiện tại</FormLabel>
                                        <div className='mt-2'>
                                            <Input
                                                value={
                                                    service?.roomName
                                                        ? `${service.roomName}${service.roomNumber ? ` - ${service.roomNumber}` : ''}`
                                                        : 'Chưa có phòng'
                                                }
                                                disabled
                                                className='bg-muted cursor-not-allowed text-foreground'
                                            />
                                        </div>
                                    </div>

                                    {/* Room Selection - Combobox Dropdown */}
                                    <div>
                                        <FormLabel>Thay đổi phòng khám (tùy chọn)</FormLabel>
                                        <Popover open={roomPopoverOpen} onOpenChange={setRoomPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    aria-expanded={roomPopoverOpen}
                                                    className='w-full justify-between mt-2'
                                                >
                                                    {selectedRoom ? (
                                                        <span className='truncate'>
                                                            {selectedRoom.roomName} - P.{selectedRoom.roomNumber}
                                                        </span>
                                                    ) : (
                                                        <span className='text-muted-foreground'>Chọn phòng khám mới...</span>
                                                    )}
                                                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-[500px] p-0' align='start'>
                                                <Command>
                                                    <CommandInput
                                                        placeholder='Tìm kiếm phòng khám...'
                                                        value={roomKeyword}
                                                        onValueChange={setRoomKeyword}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            {loadingRooms ? (
                                                                <div className='flex justify-center py-4'>
                                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                                </div>
                                                            ) : (
                                                                'Không tìm thấy phòng khám.'
                                                            )}
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {rooms.map((room) => (
                                                                <CommandItem
                                                                    key={room.roomId}
                                                                    value={`${room.roomName} ${room.roomNumber} ${room.departmentName}`}
                                                                    onSelect={() => {
                                                                        setSelectedRoom(room)
                                                                        setRoomPopoverOpen(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-2 h-4 w-4',
                                                                            selectedRoom?.roomId === room.roomId
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
                                                                        )}
                                                                    />
                                                                    <div className='flex-1'>
                                                                        <div className='font-medium'>{room.roomName}</div>
                                                                        <div className='text-xs text-muted-foreground'>
                                                                            P.{room.roomNumber} - {room.departmentName}
                                                                        </div>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {selectedRoom && (
                                            <div className='flex items-center gap-2 mt-2 text-sm text-muted-foreground'>
                                                <span>Sẽ chuyển sang: {selectedRoom.departmentName}</span>
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-6 px-2'
                                                    onClick={() => setSelectedRoom(null)}
                                                >
                                                    <X className='h-3 w-3' />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description - full width */}
                                    <FormField
                                        control={form.control}
                                        name='description'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mô tả</FormLabel>
                                                <FormControl>
                                                    <Textarea rows={4} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </ScrollArea>

                            <DialogFooter className='pt-4 border-t'>
                                <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                                    Hủy
                                </Button>
                                <Button type='submit' disabled={isPending}>
                                    {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                    Cập nhật
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
