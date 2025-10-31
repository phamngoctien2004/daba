/**
 * Admin Doctor Schedules Management Route
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChatButton } from '@/components/chat-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DoctorScheduleSidebar, ScheduleCalendar } from '@/features/admin-schedules/components'
import { useAvailableSchedules } from '@/features/admin-schedules/hooks/use-schedules'
import type { ScheduleFilters } from '@/features/admin-schedules/types'

function AdminDoctorSchedulesPage() {
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null)
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null)
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 }) // Start on Monday
    )

    // Calculate week range
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })

    // Prepare filters for API
    const scheduleFilters = useMemo<ScheduleFilters>(() => ({
        startDate: format(currentWeekStart, 'yyyy-MM-dd'),
        endDate: format(weekEnd, 'yyyy-MM-dd'),
        departmentId: selectedDepartmentId || undefined,
        doctorId: selectedDoctorId || undefined,
    }), [currentWeekStart, weekEnd, selectedDepartmentId, selectedDoctorId])

    // Fetch schedules
    const { data, isLoading } = useAvailableSchedules(scheduleFilters)
    const schedules = data?.data || []

    // Week navigation handlers
    const handlePrevWeek = () => {
        setCurrentWeekStart(prev => subWeeks(prev, 1))
    }

    const handleNextWeek = () => {
        setCurrentWeekStart(prev => addWeeks(prev, 1))
    }

    return (
        <>
            <Header fixed>
                <GlobalSearch />
                <div className='ms-auto flex items-center gap-1'>
                    <ThemeSwitch />
                    <ChatButton />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Lịch làm việc Bác sĩ</h2>
                        <p className='text-muted-foreground'>Quản lý lịch làm việc và ca trực của bác sĩ</p>
                    </div>
                </div>

                {/* Main Content: Sidebar + Calendar */}
                <div className="flex gap-4 h-[calc(100vh-200px)]">
                    {/* Left Sidebar */}
                    <div className="w-80 flex-shrink-0">
                        <DoctorScheduleSidebar
                            selectedDepartmentId={selectedDepartmentId}
                            selectedDoctorId={selectedDoctorId}
                            onDepartmentSelect={setSelectedDepartmentId}
                            onDoctorSelect={setSelectedDoctorId}
                        />
                    </div>

                    {/* Right Calendar */}
                    <div className="flex-1 overflow-hidden">
                        <ScheduleCalendar
                            schedules={schedules}
                            isLoading={isLoading}
                            weekStart={currentWeekStart}
                            onPrevWeek={handlePrevWeek}
                            onNextWeek={handleNextWeek}
                        />
                    </div>
                </div>
            </Main>
        </>
    )
}

export const Route = createFileRoute('/_authenticated/admin/doctor-schedules')({
    component: AdminDoctorSchedulesPage,
})
