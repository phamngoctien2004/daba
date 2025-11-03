import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Search, X, Check, ChevronsUpDown } from 'lucide-react'

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateService } from '../hooks/use-services-crud'
import { searchServicesForSelection, searchParameters } from '../api/services-crud'
import { fetchRooms } from '../api/rooms'
import type { CreateServiceRequest, Service, ServiceParameter, ServiceType } from '../types'
import type { Room } from '../api/rooms'

const createServiceSchema = z.object({
    name: z.string().min(1, 'Tên dịch vụ là bắt buộc'),
    type: z.enum(['KHAC', 'DICH_VU', 'XET_NGHIEM']),
    price: z.number().min(0, 'Giá phải >= 0'),
    description: z.string().optional(),
    roomId: z.number().optional(),
    detailIds: z.array(z.number()).optional(),
    paramIds: z.array(z.number()).optional(),
})

type FormValues = z.infer<typeof createServiceSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateServiceDialog({ open, onOpenChange }: Props) {
    const [serviceKeyword, setServiceKeyword] = useState('')
    const [paramKeyword, setParamKeyword] = useState('')
    const [roomKeyword, setRoomKeyword] = useState('')
    const [roomPopoverOpen, setRoomPopoverOpen] = useState(false)
    const [services, setServices] = useState<Service[]>([])
    const [params, setParams] = useState<ServiceParameter[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [loadingServices, setLoadingServices] = useState(false)
    const [loadingParams, setLoadingParams] = useState(false)
    const [loadingRooms, setLoadingRooms] = useState(false)

    // Store selected items separately to persist across searches
    const [selectedServicesMap, setSelectedServicesMap] = useState<Map<number, Service>>(new Map())
    const [selectedParamsMap, setSelectedParamsMap] = useState<Map<number, ServiceParameter>>(new Map())
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(createServiceSchema),
        defaultValues: {
            name: '',
            type: 'DICH_VU',
            price: 0,
            description: '',
            detailIds: [],
            paramIds: [],
        },
    })

    const { mutate, isPending } = useCreateService(() => {
        onOpenChange(false)
        form.reset()
        setServiceKeyword('')
        setParamKeyword('')
        setRoomKeyword('')
        setServices([])
        setParams([])
        setRooms([])
        setSelectedServicesMap(new Map())
        setSelectedParamsMap(new Map())
        setSelectedRoom(null)
    })

    const selectedType = form.watch('type')
    const selectedDetailIds = form.watch('detailIds') || []
    const selectedParamIds = form.watch('paramIds') || []

    // Get selected items from map
    const selectedServices = Array.from(selectedServicesMap.values())
    const selectedParams = Array.from(selectedParamsMap.values())

    useEffect(() => {
        if (selectedType === 'DICH_VU' && serviceKeyword.trim()) {
            setLoadingServices(true)
            searchServicesForSelection({ keyword: serviceKeyword })
                .then(setServices)
                .finally(() => setLoadingServices(false))
        }
    }, [serviceKeyword, selectedType])

    useEffect(() => {
        if (selectedType === 'XET_NGHIEM' && paramKeyword.trim()) {
            setLoadingParams(true)
            searchParameters({ keyword: paramKeyword })
                .then(setParams)
                .finally(() => setLoadingParams(false))
        }
    }, [paramKeyword, selectedType])

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

    useEffect(() => {
        form.setValue('detailIds', [])
        form.setValue('paramIds', [])
        setServiceKeyword('')
        setParamKeyword('')
        setServices([])
        setParams([])
        setSelectedServicesMap(new Map())
        setSelectedParamsMap(new Map())
    }, [selectedType])

    const toggleService = (service: Service) => {
        const newMap = new Map(selectedServicesMap)
        const newIds = [...selectedDetailIds]

        if (newMap.has(service.id)) {
            newMap.delete(service.id)
            form.setValue('detailIds', newIds.filter(id => id !== service.id))
        } else {
            newMap.set(service.id, service)
            form.setValue('detailIds', [...newIds, service.id])
        }
        setSelectedServicesMap(newMap)
    }

    const toggleParam = (param: ServiceParameter) => {
        const newMap = new Map(selectedParamsMap)
        const newIds = [...selectedParamIds]

        if (newMap.has(param.id)) {
            newMap.delete(param.id)
            form.setValue('paramIds', newIds.filter(id => id !== param.id))
        } else {
            newMap.set(param.id, param)
            form.setValue('paramIds', [...newIds, param.id])
        }
        setSelectedParamsMap(newMap)
    }

    const removeService = (id: number) => {
        const newMap = new Map(selectedServicesMap)
        newMap.delete(id)
        setSelectedServicesMap(newMap)
        form.setValue('detailIds', selectedDetailIds.filter((sid) => sid !== id))
    }

    const removeParam = (id: number) => {
        const newMap = new Map(selectedParamsMap)
        newMap.delete(id)
        setSelectedParamsMap(newMap)
        form.setValue('paramIds', selectedParamIds.filter((pid) => pid !== id))
    }

    const onSubmit = (values: FormValues) => {
        const payload: CreateServiceRequest = {
            name: values.name,
            type: values.type as ServiceType,
            price: values.price,
            description: values.description,
            roomId: selectedRoom?.roomId ?? null,
        }

        if (values.type === 'DICH_VU' && values.detailIds?.length) {
            payload.detailIds = values.detailIds
        }
        if (values.type === 'XET_NGHIEM' && values.paramIds?.length) {
            payload.paramIds = values.paramIds
        }

        mutate(payload)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-[1000px] w-full max-h-[90vh] flex flex-col'>
                <DialogHeader>
                    <DialogTitle>Thêm dịch vụ mới</DialogTitle>
                    <DialogDescription>Nhập thông tin dịch vụ mới</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col flex-1 overflow-hidden'>
                        <div className='flex-1 overflow-y-auto pr-4'>
                            <div className='space-y-4 pb-2'>
                                {/* Name, Type and Price - 3 columns in one row */}
                                <div className='grid grid-cols-12 gap-4'>
                                    <div className='col-span-5'>
                                        <FormField
                                            control={form.control}
                                            name='name'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tên dịch vụ *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder='Nhập tên dịch vụ' {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className='col-span-4'>
                                        <FormField
                                            control={form.control}
                                            name='type'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Loại dịch vụ *</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value='DICH_VU'>Dịch vụ</SelectItem>
                                                            <SelectItem value='XET_NGHIEM'>Xét nghiệm</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className='col-span-3'>
                                        <FormField
                                            control={form.control}
                                            name='price'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Giá (VNĐ) *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type='number'
                                                            placeholder='0'
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Description - full width */}
                                <FormField
                                    control={form.control}
                                    name='description'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mô tả</FormLabel>
                                            <FormControl>
                                                <Textarea rows={2} placeholder='Nhập mô tả chi tiết' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Room Selection - Combobox Dropdown */}
                                <div>
                                    <FormLabel>Phòng khám (tùy chọn)</FormLabel>
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
                                                    <span className='text-muted-foreground'>Chọn phòng khám...</span>
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
                                            <span>Đã chọn: {selectedRoom.departmentName}</span>
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

                                {/* Select Services - for DICH_VU */}
                                {selectedType === 'DICH_VU' && (
                                    <div className='border rounded-lg p-4 space-y-3'>
                                        <FormLabel className='text-base font-semibold'>Dịch vụ trong gói</FormLabel>

                                        <div className='grid grid-cols-2 gap-4'>
                                            {/* Left: Search and select - 50% */}
                                            <div className='space-y-2'>
                                                <div className='relative'>
                                                    <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                                                    <Input
                                                        placeholder='Tìm kiếm dịch vụ...'
                                                        value={serviceKeyword}
                                                        onChange={(e) => setServiceKeyword(e.target.value)}
                                                        className='pl-9'
                                                    />
                                                </div>
                                                {loadingServices && (
                                                    <div className='flex justify-center py-4'>
                                                        <Loader2 className='h-5 w-5 animate-spin' />
                                                    </div>
                                                )}
                                                {!loadingServices && services.length > 0 && (
                                                    <ScrollArea className='h-40 border rounded p-2'>
                                                        {services.map((s) => (
                                                            <div
                                                                key={s.id}
                                                                className='flex items-start space-x-2 py-2 px-2 rounded hover:bg-muted/50'
                                                            >
                                                                <Checkbox
                                                                    checked={selectedDetailIds.includes(s.id)}
                                                                    onCheckedChange={() => toggleService(s)}
                                                                />
                                                                <div
                                                                    className='flex-1 text-sm leading-tight cursor-pointer'
                                                                    onClick={() => toggleService(s)}
                                                                >
                                                                    <div>{s.name}</div>
                                                                    <div className='text-xs text-muted-foreground'>
                                                                        {s.price.toLocaleString()} VNĐ
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </ScrollArea>
                                                )}
                                            </div>

                                            {/* Right: Selected services - 50% */}
                                            <div className='space-y-2'>
                                                <div className='text-sm font-medium text-muted-foreground'>
                                                    Đã chọn ({selectedServices.length})
                                                </div>
                                                <ScrollArea className='h-40 border rounded p-2 bg-muted/30'>
                                                    {selectedServices.length === 0 ? (
                                                        <div className='flex items-center justify-center h-full text-sm text-muted-foreground'>
                                                            Chưa chọn dịch vụ nào
                                                        </div>
                                                    ) : (
                                                        <div className='space-y-2'>
                                                            {selectedServices.map((s) => (
                                                                <div
                                                                    key={s.id}
                                                                    className='flex items-start justify-between gap-2 p-2 bg-background rounded border'
                                                                >
                                                                    <div className='flex-1 min-w-0'>
                                                                        <div className='text-sm font-medium truncate'>{s.name}</div>
                                                                        <div className='text-xs text-muted-foreground'>
                                                                            {s.price.toLocaleString()} VNĐ
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type='button'
                                                                        variant='ghost'
                                                                        size='sm'
                                                                        className='h-6 w-6 p-0 shrink-0'
                                                                        onClick={() => removeService(s.id)}
                                                                    >
                                                                        <X className='h-4 w-4' />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </ScrollArea>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Select Parameters - for XET_NGHIEM */}
                                {selectedType === 'XET_NGHIEM' && (
                                    <div className='border rounded-lg p-4 space-y-3'>
                                        <FormLabel className='text-base font-semibold'>Thông số xét nghiệm</FormLabel>

                                        <div className='grid grid-cols-2 gap-4'>
                                            {/* Left: Search and select - 50% */}
                                            <div className='space-y-2'>
                                                <div className='relative'>
                                                    <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                                                    <Input
                                                        placeholder='Tìm kiếm thông số...'
                                                        value={paramKeyword}
                                                        onChange={(e) => setParamKeyword(e.target.value)}
                                                        className='pl-9'
                                                    />
                                                </div>
                                                {loadingParams && (
                                                    <div className='flex justify-center py-4'>
                                                        <Loader2 className='h-5 w-5 animate-spin' />
                                                    </div>
                                                )}
                                                {!loadingParams && params.length > 0 && (
                                                    <ScrollArea className='h-40 border rounded p-2'>
                                                        {params.map((p) => (
                                                            <div
                                                                key={p.id}
                                                                className='flex items-start space-x-2 py-2 px-2 rounded hover:bg-muted/50'
                                                            >
                                                                <Checkbox
                                                                    checked={selectedParamIds.includes(p.id)}
                                                                    onCheckedChange={() => toggleParam(p)}
                                                                />
                                                                <div
                                                                    className='flex-1 text-sm leading-tight cursor-pointer'
                                                                    onClick={() => toggleParam(p)}
                                                                >
                                                                    <div>{p.name}</div>
                                                                    <div className='text-xs text-muted-foreground'>
                                                                        {p.unit} - Khoảng: {p.range}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </ScrollArea>
                                                )}
                                            </div>

                                            {/* Right: Selected params - 50% */}
                                            <div className='space-y-2'>
                                                <div className='text-sm font-medium text-muted-foreground'>
                                                    Đã chọn ({selectedParams.length})
                                                </div>
                                                <ScrollArea className='h-40 border rounded p-2 bg-muted/30'>
                                                    {selectedParams.length === 0 ? (
                                                        <div className='flex items-center justify-center h-full text-sm text-muted-foreground'>
                                                            Chưa chọn thông số nào
                                                        </div>
                                                    ) : (
                                                        <div className='space-y-2'>
                                                            {selectedParams.map((p) => (
                                                                <div
                                                                    key={p.id}
                                                                    className='flex items-start justify-between gap-2 p-2 bg-background rounded border'
                                                                >
                                                                    <div className='flex-1 min-w-0'>
                                                                        <div className='text-sm font-medium truncate'>{p.name}</div>
                                                                        <div className='text-xs text-muted-foreground'>
                                                                            {p.unit} - {p.range}
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type='button'
                                                                        variant='ghost'
                                                                        size='sm'
                                                                        className='h-6 w-6 p-0 shrink-0'
                                                                        onClick={() => removeParam(p.id)}
                                                                    >
                                                                        <X className='h-4 w-4' />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </ScrollArea>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className='pt-4 border-t'>
                            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isPending}>
                                Hủy
                            </Button>
                            <Button type='submit' disabled={isPending}>
                                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                Lưu
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
