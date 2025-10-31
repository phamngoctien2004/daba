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
    SANG: 'Sáng (7h-12h)',
    CHIEU: 'Chiều (12h-17h)',
    TOI: 'Tối (17h-21h)',
}

const SHIFT_COLORS: Record<Shift, string> = {
    SANG: 'bg-green-100 border-green-300 text-green-800',
    CHIEU: 'bg-blue-100 border-blue-300 text-blue-800',
    TOI: 'bg-purple-100 border-purple-300 text-purple-800',
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

    const getShiftBadge = (shift: Shift) => (
        <Badge
            variant="outline"
            className={cn('text-xs font-medium', SHIFT_COLORS[shift])}
        >
            {SHIFT_LABELS[shift]}
        </Badge>
    )

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
                    <div className="grid grid-cols-7 gap-2">
                        {schedules.map((schedule) => {
                            const scheduleDate = new Date(schedule.date)
                            const isTodayDate = isToday(scheduleDate)

                            return (
                                <div key={schedule.date} className="border rounded-lg">
                                    {/* Date Header - Highlight if today */}
                                    <div className={cn(
                                        "border-b p-2 text-center",
                                        isTodayDate
                                            ? "bg-primary/10 border-primary/20" // Highlight today
                                            : "bg-muted/50"
                                    )}>
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
                                        <Badge
                                            variant={isTodayDate ? "default" : "secondary"}
                                            className="mt-1 text-xs"
                                        >
                                            {schedule.totalSlot} lịch
                                        </Badge>
                                    </div>

                                    {/* Doctor Schedules */}
                                    <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                                        {schedule.doctors.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-4">
                                                Không có lịch
                                            </p>
                                        ) : (
                                            schedule.doctors.map((doctor) => (
                                                <DoctorScheduleCard
                                                    key={`${doctor.id}-${doctor.shift}`}
                                                    doctor={doctor}
                                                    formatTimeSlot={formatTimeSlot}
                                                    getShiftBadge={getShiftBadge}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            )
                        })}
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
    getShiftBadge: (shift: Shift) => React.ReactElement
}

function DoctorScheduleCard({
    doctor,
    formatTimeSlot,
    getShiftBadge,
}: DoctorScheduleCardProps) {
    return (
        <div
            className={cn(
                'rounded-lg border p-2 text-xs',
                doctor.available
                    ? 'bg-card hover:bg-accent'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' // Red background for unavailable
            )}
        >
            {/* Doctor Info */}
            <div className="font-medium truncate" title={doctor.position}>
                {doctor.position}
            </div>
            <div className="text-muted-foreground truncate text-[10px]" title={doctor.fullName}>
                {doctor.fullName}
            </div>

            {/* Shift Badge */}
            <div className="mt-1">
                {getShiftBadge(doctor.shift)}
            </div>

            {/* Invalid Times */}
            {doctor.invalidTimes.length > 0 && (
                <div className="mt-2 pt-2 border-t">
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
        </div>
    )
}
