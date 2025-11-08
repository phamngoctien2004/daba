/**
 * Schedule Calendar Component
 * Calendar grid showing doctor schedules
 */

import { format, parse, isToday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ScheduleDate, DoctorScheduleInfo, Shift } from '../types'

interface ScheduleCalendarProps {
    schedules: ScheduleDate[]
    isLoading: boolean
    weekStart: Date
    onPrevWeek: () => void
    onNextWeek: () => void
}

const SHIFT_LABELS: Record<Shift, string> = {
    SANG: 'Sáng',
    CHIEU: 'Chiều',
    TOI: 'Tối',
}

export function ScheduleCalendar({
    schedules,
    isLoading,
    weekStart,
    onPrevWeek,
    onNextWeek,
}: ScheduleCalendarProps) {
    const formatTimeSlot = (time: string) => {
        try {
            const parsed = parse(time, 'HH:mm:ss', new Date())
            return format(parsed, 'HH:mm')
        } catch {
            return time.slice(0, 5) // Fallback to first 5 chars
        }
    }

    if (isLoading) {
        return (
            <Card className="flex-1">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-64" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                        {[...Array(7)].map((_, i) => (
                            <Skeleton key={i} className="h-96" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex-1">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Lịch làm việc
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={onPrevWeek}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium min-w-[200px] text-center">
                            Tuần {format(weekStart, 'w', { locale: vi })} - Tháng {format(weekStart, 'M, yyyy')}
                        </div>
                        <Button variant="outline" size="icon" onClick={onNextWeek}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {schedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CalendarIcon className="h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">Không có lịch làm việc</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Chọn khoa hoặc bác sĩ để xem lịch làm việc
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border table-fixed">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="border p-2 text-sm font-semibold text-left w-20">Ca</th>
                                    {schedules.map((schedule) => {
                                        const scheduleDate = new Date(schedule.date)
                                        const isTodayDate = isToday(scheduleDate)

                                        return (
                                            <th
                                                key={schedule.date}
                                                className={cn(
                                                    "border p-2 text-center",
                                                    isTodayDate && "bg-primary/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "text-xs",
                                                    isTodayDate ? "text-primary font-semibold" : "text-muted-foreground"
                                                )}>
                                                    {schedule.dateName}
                                                </div>
                                                <div className={cn(
                                                    "text-sm font-medium",
                                                    isTodayDate && "text-primary"
                                                )}>
                                                    {format(scheduleDate, 'dd/MM')}
                                                </div>
                                            </th>
                                        )
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {(['SANG', 'CHIEU', 'TOI'] as const).map((shift) => (
                                    <tr key={shift} className="h-32">
                                        <td className="border p-2 bg-muted/30 font-medium text-sm align-middle text-center">
                                            {SHIFT_LABELS[shift]}
                                        </td>
                                        {schedules.map((schedule) => {
                                            const scheduleDate = new Date(schedule.date)
                                            const isTodayDate = isToday(scheduleDate)
                                            const doctorsInShift = schedule.doctors.filter(d => d.shift === shift)

                                            return (
                                                <td
                                                    key={`${schedule.date}-${shift}`}
                                                    className={cn(
                                                        "border p-2 align-top",
                                                        isTodayDate && "bg-primary/5"
                                                    )}
                                                >
                                                    {doctorsInShift.length === 0 ? (
                                                        <div className="text-xs text-muted-foreground text-center py-2">-</div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {doctorsInShift.map((doctor) => (
                                                                <DoctorScheduleCard
                                                                    key={`${doctor.id}-${doctor.shift}`}
                                                                    doctor={doctor}
                                                                    formatTimeSlot={formatTimeSlot}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ==================== Doctor Schedule Card ====================

interface DoctorScheduleCardProps {
    doctor: DoctorScheduleInfo
    formatTimeSlot: (time: string) => string
}

function DoctorScheduleCard({
    doctor,
    formatTimeSlot,
}: DoctorScheduleCardProps) {
    return (
        <div
            className={cn(
                'rounded-md border p-2 text-xs h-full',
                doctor.available
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                    : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
            )}
        >
            {/* Doctor Info */}
            <div className="font-medium truncate" title={doctor.position}>
                {doctor.position}
            </div>
            <div className="text-muted-foreground truncate text-[11px]" title={doctor.fullName}>
                BS. {doctor.fullName}
            </div>

            {/* Room */}
            {doctor.roomName && (
                <div className="text-[10px] text-muted-foreground mt-1">
                    Phòng: {doctor.roomName}
                </div>
            )}

            {/* Invalid Times */}
            {doctor.invalidTimes.length > 0 && (
                <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="text-[10px] text-muted-foreground mb-1">Đã đặt:</div>
                    <div className="flex flex-wrap gap-1">
                        {doctor.invalidTimes.map((time, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="text-[10px] px-1 py-0"
                            >
                                {formatTimeSlot(time)}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Unavailable badge */}
            {!doctor.available && (
                <Badge variant="destructive" className="mt-2 text-[10px]">
                    Nghỉ phép
                </Badge>
            )}
        </div>
    )
}
