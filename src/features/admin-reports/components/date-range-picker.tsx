/**
 * Date Range Picker Component for Reports
 */

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { DateRange as CalendarDateRange } from 'react-day-picker'

export interface DateRange {
    fromDate: string
    toDate: string
}

interface DateRangePickerProps {
    value: DateRange
    onChange: (range: DateRange) => void
    className?: string
}

const presets = [
    { label: 'Hôm nay', getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: '7 ngày qua', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
    { label: '30 ngày qua', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
    { label: 'Tháng này', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    {
        label: 'Tháng trước', getValue: () => {
            const lastMonth = subMonths(new Date(), 1)
            return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
        }
    },
    { label: 'Năm nay', getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
]

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: value.fromDate ? new Date(value.fromDate) : undefined,
        to: value.toDate ? new Date(value.toDate) : undefined,
    })

    const handlePresetSelect = (presetLabel: string) => {
        const preset = presets.find((p) => p.label === presetLabel)
        if (preset) {
            const { from, to } = preset.getValue()
            setDateRange({ from, to })
            onChange({
                fromDate: format(from, 'yyyy-MM-dd'),
                toDate: format(to, 'yyyy-MM-dd'),
            })
            setIsOpen(false)
        }
    }

    const handleDateSelect = (range: CalendarDateRange | undefined) => {
        if (range) {
            setDateRange({ from: range.from, to: range.to })
            if (range.from && range.to) {
                onChange({
                    fromDate: format(range.from, 'yyyy-MM-dd'),
                    toDate: format(range.to, 'yyyy-MM-dd'),
                })
            }
        }
    }

    const displayText = dateRange.from && dateRange.to
        ? `${format(dateRange.from, 'dd/MM/yyyy', { locale: vi })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: vi })}`
        : 'Chọn khoảng thời gian'

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant='outline'
                        className={cn('w-[280px] justify-start text-left font-normal', !dateRange.from && 'text-muted-foreground')}
                    >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {displayText}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                    <div className='flex'>
                        <div className='border-r p-3'>
                            <div className='text-sm font-medium mb-2'>Chọn nhanh</div>
                            <div className='space-y-1'>
                                {presets.map((preset) => (
                                    <Button
                                        key={preset.label}
                                        variant='ghost'
                                        className='w-full justify-start text-sm'
                                        onClick={() => handlePresetSelect(preset.label)}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className='p-3'>
                            <Calendar
                                mode='range'
                                selected={{ from: dateRange.from, to: dateRange.to }}
                                onSelect={handleDateSelect}
                                numberOfMonths={2}
                                locale={vi}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
