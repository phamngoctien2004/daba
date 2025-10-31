import { useState, useEffect } from 'react'
import { CalendarIcon, FilterIcon, XIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import type { InvoiceFilters } from '../types'

interface InvoiceFiltersProps {
    filters: InvoiceFilters
    onFiltersChange: (filters: InvoiceFilters) => void
    onReset: () => void
}

export function InvoiceFilters({ filters, onFiltersChange, onReset }: InvoiceFiltersProps) {
    const [fromDateOpen, setFromDateOpen] = useState(false)
    const [toDateOpen, setToDateOpen] = useState(false)

    // Local state for keyword input (before debounce)
    const [keywordInput, setKeywordInput] = useState(filters.keyword || '')

    // Debounce keyword input (500ms delay)
    const debouncedKeyword = useDebounce(keywordInput, 500)

    // Parse string dates to Date objects for Calendar component
    const fromDateValue = filters.fromDate ? new Date(filters.fromDate) : undefined
    const toDateValue = filters.toDate ? new Date(filters.toDate) : undefined

    // Update filters when debounced keyword changes
    useEffect(() => {
        if (debouncedKeyword !== filters.keyword) {
            onFiltersChange({ ...filters, keyword: debouncedKeyword || undefined })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedKeyword])

    // Sync local input with external filter changes (e.g., reset)
    useEffect(() => {
        if (filters.keyword !== keywordInput) {
            setKeywordInput(filters.keyword || '')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.keyword])

    const handleKeywordChange = (value: string) => {
        setKeywordInput(value)
    }

    const handleFromDateChange = (date: Date | undefined) => {
        onFiltersChange({
            ...filters,
            fromDate: date ? format(date, 'yyyy-MM-dd') : undefined
        })
        setFromDateOpen(false)
    }

    const handleToDateChange = (date: Date | undefined) => {
        onFiltersChange({
            ...filters,
            toDate: date ? format(date, 'yyyy-MM-dd') : undefined
        })
        setToDateOpen(false)
    }

    const handleStatusChange = (value: string) => {
        onFiltersChange({
            ...filters,
            paymentStatus: value === 'all' ? undefined : (value as 'CHUA_THANH_TOAN' | 'DA_THANH_TOAN' | 'THANH_TOAN_MOT_PHAN')
        })
    }

    const handleMethodChange = (value: string) => {
        onFiltersChange({
            ...filters,
            method: value === 'all' ? undefined : (value as 'TIEN_MAT' | 'CHUYEN_KHOAN')
        })
    }

    const hasActiveFilters =
        filters.keyword ||
        filters.fromDate ||
        filters.toDate ||
        filters.paymentStatus ||
        filters.method

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <FilterIcon className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Bộ lọc</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-5 flex-1">
                    {/* Keyword search */}
                    <div className="space-y-2">
                        <Label htmlFor="keyword">Tìm kiếm</Label>
                        <Input
                            id="keyword"
                            placeholder="Mã hóa đơn, tên bệnh nhân..."
                            value={keywordInput}
                            onChange={(e) => handleKeywordChange(e.target.value)}
                        />
                    </div>        {/* From date */}
                    <div className="space-y-2">
                        <Label>Từ ngày</Label>
                        <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !filters.fromDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {fromDateValue ? (
                                        format(fromDateValue, 'dd/MM/yyyy', { locale: vi })
                                    ) : (
                                        <span>Chọn ngày</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={fromDateValue}
                                    onSelect={handleFromDateChange}
                                    initialFocus
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* To date */}
                    <div className="space-y-2">
                        <Label>Đến ngày</Label>
                        <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !filters.toDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {toDateValue ? (
                                        format(toDateValue, 'dd/MM/yyyy', { locale: vi })
                                    ) : (
                                        <span>Chọn ngày</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={toDateValue}
                                    onSelect={handleToDateChange}
                                    initialFocus
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Payment status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Trạng thái thanh toán</Label>
                        <Select
                            value={filters.paymentStatus || 'all'}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="CHUA_THANH_TOAN">Chưa thanh toán</SelectItem>
                                <SelectItem value="DA_THANH_TOAN">Đã thanh toán</SelectItem>
                                <SelectItem value="THANH_TOAN_MOT_PHAN">Thanh toán một phần</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment method */}
                    <div className="space-y-2">
                        <Label htmlFor="method">Phương thức</Label>
                        <Select
                            value={filters.method || 'all'}
                            onValueChange={handleMethodChange}
                        >
                            <SelectTrigger id="method">
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="TIEN_MAT">Tiền mặt</SelectItem>
                                <SelectItem value="CHUYEN_KHOAN">Chuyển khoản</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Reset button */}
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="default"
                        onClick={onReset}
                        className="whitespace-nowrap"
                    >
                        <XIcon className="mr-2 h-4 w-4" />
                        Xóa bộ lọc
                    </Button>
                )}
            </div>
        </div>
    )
}
