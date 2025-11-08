import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useAvailableSchedules } from '../hooks/use-leaves'
import type { AvailableSchedule } from '../api/schedules'

const SHIFTS = [
    { key: 'SANG', label: 'Sáng', time: '(7h-12h)' },
    { key: 'CHIEU', label: 'Chiều', time: '(12h-17h)' },
    { key: 'TOI', label: 'Tối', time: '(17h-22h)' },
] as const

const DAY_NAMES = [
    { key: 'MONDAY', label: 'Thứ 2' },
    { key: 'TUESDAY', label: 'Thứ 3' },
    { key: 'WEDNESDAY', label: 'Thứ 4' },
    { key: 'THURSDAY', label: 'Thứ 5' },
    { key: 'FRIDAY', label: 'Thứ 6' },
    { key: 'SATURDAY', label: 'Thứ 7' },
    { key: 'SUNDAY', label: 'Chủ nhật' },
] as const

export function WeeklyScheduleCalendar() {
    const { user } = useAuthStore()
    const doctorId = user?.doctor?.id

    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        return startOfWeek(new Date(), { weekStartsOn: 1 }) // Start on Monday
    })

    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })

    const { data: schedules = [], isLoading } = useAvailableSchedules({
        startDate: format(currentWeekStart, 'yyyy-MM-dd'),
        endDate: format(weekEnd, 'yyyy-MM-dd'),
        doctorId, // Chỉ lấy lịch của bác sĩ hiện tại
    })

    const goToPreviousWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, -7))
    }

    const goToNextWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, 7))
    }

    const goToCurrentWeek = () => {
        setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
    }

    // Create a map for easy lookup: date -> dayName -> shift -> schedule
    const scheduleMap = new Map<string, AvailableSchedule>()
    schedules.forEach((schedule) => {
        scheduleMap.set(schedule.date, schedule)
    })

    const getShiftData = (dayDate: Date, shiftKey: string) => {
        const dateStr = format(dayDate, 'yyyy-MM-dd')
        const daySchedule = scheduleMap.get(dateStr)

        if (!daySchedule) return null

        const shiftDoctors = daySchedule.doctors.filter((d) => d.shift === shiftKey)
        return shiftDoctors.length > 0 ? shiftDoctors : null
    }

    return (
        <div className='space-y-4'>
            {/* Week Navigation */}
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-lg font-semibold'>
                        Tuần {format(currentWeekStart, 'dd/MM/yyyy', { locale: vi })} -{' '}
                        {format(weekEnd, 'dd/MM/yyyy', { locale: vi })}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                        Tháng {format(currentWeekStart, 'MM/yyyy', { locale: vi })}
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm' onClick={goToCurrentWeek}>
                        Tuần hiện tại
                    </Button>
                    <Button variant='outline' size='icon' onClick={goToPreviousWeek}>
                        <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' size='icon' onClick={goToNextWeek}>
                        <ChevronRight className='h-4 w-4' />
                    </Button>
                </div>
            </div>

            {/* Calendar Table */}
            <Card>
                <CardContent className='p-0'>
                    {isLoading ? (
                        <div className='flex items-center justify-center py-12'>
                            <div className='text-sm text-muted-foreground'>Đang tải lịch làm việc...</div>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse'>
                                <thead>
                                    <tr className='border-b bg-muted/50'>
                                        <th className='w-32 border-r p-3 text-left text-sm font-semibold'>
                                            Ngày
                                        </th>
                                        {SHIFTS.map((shift) => (
                                            <th key={shift.key} className='border-r p-3 text-center text-sm font-semibold last:border-r-0'>
                                                <div>{shift.label}</div>
                                                <div className='text-xs font-normal text-muted-foreground'>
                                                    {shift.time}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DAY_NAMES.map((day, dayIndex) => {
                                        const dayDate = addDays(currentWeekStart, dayIndex)
                                        const isToday = format(dayDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

                                        return (
                                            <tr key={day.key} className='border-b last:border-b-0'>
                                                <td className={cn('border-r p-3', isToday && 'bg-primary/5')}>
                                                    <div className='font-medium'>{day.label}</div>
                                                    <div className='text-xs text-muted-foreground'>
                                                        {format(dayDate, 'dd/MM', { locale: vi })}
                                                    </div>
                                                </td>
                                                {SHIFTS.map((shift) => {
                                                    const shiftDoctors = getShiftData(dayDate, shift.key)

                                                    return (
                                                        <td
                                                            key={shift.key}
                                                            className={cn(
                                                                'border-r p-2 align-top last:border-r-0',
                                                                isToday && 'bg-primary/5'
                                                            )}
                                                        >
                                                            {shiftDoctors ? (
                                                                <div className='space-y-2'>
                                                                    {shiftDoctors.map((doctor) => (
                                                                        <div
                                                                            key={`${doctor.id}-${shift.key}`}
                                                                            className={cn(
                                                                                'rounded-md border p-2 text-xs',
                                                                                doctor.available
                                                                                    ? 'border-green-200 bg-green-50'
                                                                                    : 'border-red-200 bg-red-50'
                                                                            )}
                                                                        >
                                                                            <div className='font-medium'>{doctor.fullName}</div>
                                                                            <div className='text-muted-foreground'>{doctor.roomName}</div>
                                                                            {!doctor.available && (
                                                                                <Badge variant='destructive' className='mt-1 text-xs'>
                                                                                    Nghỉ phép
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className='text-center text-xs text-muted-foreground'>-</div>
                                                            )}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Legend */}
            <div className='flex items-center gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                    <div className='h-4 w-4 rounded border border-green-200 bg-green-50' />
                    <span>Có lịch làm việc</span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='h-4 w-4 rounded border border-red-200 bg-red-50' />
                    <span>Nghỉ phép</span>
                </div>
            </div>
        </div>
    )
}
