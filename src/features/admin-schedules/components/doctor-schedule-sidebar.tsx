/**
 * Doctor Schedule Sidebar Component
 * Left sidebar for selecting department/doctor with mode selector
 */

import { useMemo, useState, useEffect } from 'react'
import { Building2, Search, User, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
    useAllDoctors,
    useDepartments,
    useDoctorsByDepartment,
} from '../hooks/use-schedules'
import type { DoctorBasic } from '../types'

interface DoctorScheduleSidebarProps {
    selectedDepartmentId: number | null
    selectedDoctorId: number | null
    onDepartmentSelect: (departmentId: number | null) => void
    onDoctorSelect: (doctorId: number | null) => void
}

export function DoctorScheduleSidebar({
    selectedDepartmentId,
    selectedDoctorId,
    onDepartmentSelect,
    onDoctorSelect,
}: DoctorScheduleSidebarProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'department' | 'doctor'>('doctor') // Default to 'doctor' mode

    const { data: departments = [], isLoading: isLoadingDepartments } =
        useDepartments()
    const { data: doctorsByDepartment = [], isLoading: isLoadingByDepartment } =
        useDoctorsByDepartment(selectedDepartmentId ?? undefined)
    const { data: allDoctors = [], isLoading: isLoadingAllDoctors } =
        useAllDoctors()

    // Filter doctors based on search term
    const filteredDoctors = useMemo(() => {
        const doctors: DoctorBasic[] =
            viewMode === 'doctor' ? allDoctors : doctorsByDepartment

        if (!searchTerm) return doctors

        return doctors.filter((doctor) =>
            doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [allDoctors, doctorsByDepartment, searchTerm, viewMode])

    const isLoadingDoctors =
        viewMode === 'doctor' ? isLoadingAllDoctors : isLoadingByDepartment

    // Auto-select first doctor when in doctor mode and doctors are loaded
    useEffect(() => {
        if (viewMode === 'doctor' && allDoctors.length > 0 && !selectedDoctorId) {
            const firstDoctor = allDoctors[0]
            onDoctorSelect(firstDoctor.id)
        }
    }, [viewMode, allDoctors, selectedDoctorId, onDoctorSelect])

    const handleDepartmentClick = (departmentId: number) => {
        if (selectedDepartmentId === departmentId) {
            // Deselect if clicking the same department
            onDepartmentSelect(null)
        } else {
            onDepartmentSelect(departmentId)
            onDoctorSelect(null) // Reset doctor selection
        }
    }

    const handleDoctorClick = (doctor: DoctorBasic) => {
        if (selectedDoctorId === doctor.id) {
            onDoctorSelect(null)
        } else {
            onDoctorSelect(doctor.id)
        }
    }

    const handleViewModeChange = (mode: 'department' | 'doctor') => {
        setViewMode(mode)
        // Reset selections when switching modes
        onDepartmentSelect(null)
        onDoctorSelect(null)
        setSearchTerm('')
    }

    return (
        <div className='flex h-full flex-col gap-4 rounded-lg border bg-card p-4'>
            {/* View Mode Select */}
            <div className='space-y-2'>
                <label className='text-sm font-medium'>Xem theo</label>
                <Select
                    value={viewMode}
                    onValueChange={(value) =>
                        handleViewModeChange(value as 'department' | 'doctor')
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='department'>
                            <div className='flex items-center gap-2'>
                                <Building2 className='h-4 w-4' />
                                <span>Theo Khoa</span>
                            </div>
                        </SelectItem>
                        <SelectItem value='doctor'>
                            <div className='flex items-center gap-2'>
                                <Users className='h-4 w-4' />
                                <span>Theo Bác sĩ</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Department Mode: Show departments list */}
            {viewMode === 'department' && (
                <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-medium'>
                        <Building2 className='h-4 w-4' />
                        <span>Chọn Khoa</span>
                    </div>
                    <ScrollArea className='h-[calc(100vh-400px)] min-h-[300px]'>
                        <div className='space-y-1'>
                            {isLoadingDepartments ? (
                                <>
                                    {[1, 2, 3, 4].map((i) => (
                                        <Skeleton key={i} className='h-12 w-full' />
                                    ))}
                                </>
                            ) : departments.length > 0 ? (
                                <>
                                    {departments.map((department) => (
                                        <button
                                            key={department.id}
                                            onClick={() => handleDepartmentClick(department.id)}
                                            className={cn(
                                                'w-full rounded-lg border p-3 text-left transition-colors',
                                                selectedDepartmentId === department.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:bg-accent'
                                            )}
                                        >
                                            <div className='flex items-center gap-2'>
                                                <Building2 className='h-4 w-4' />
                                                <span className='text-sm font-medium'>
                                                    {department.name}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <div className='py-8 text-center text-sm text-muted-foreground'>
                                    Không có khoa
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Doctor Mode: Show search and doctors list */}
            {viewMode === 'doctor' && (
                <>
                    {/* Search */}
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                        <Input
                            placeholder='Tìm kiếm bác sĩ...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='pl-9'
                        />
                    </div>

                    {/* Doctors List */}
                    <div className='flex-1 space-y-2'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2 text-sm font-medium'>
                                <User className='h-4 w-4' />
                                <span>Danh sách Bác sĩ</span>
                            </div>
                            {filteredDoctors.length > 0 && (
                                <Badge variant='secondary'>{filteredDoctors.length}</Badge>
                            )}
                        </div>
                        <ScrollArea className='h-[calc(100vh-450px)] min-h-[300px]'>
                            <div className='space-y-2'>
                                {isLoadingDoctors ? (
                                    <>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Skeleton key={i} className='h-20 w-full' />
                                        ))}
                                    </>
                                ) : filteredDoctors.length > 0 ? (
                                    <>
                                        {filteredDoctors.map((doctor) => (
                                            <button
                                                key={doctor.id}
                                                onClick={() => handleDoctorClick(doctor)}
                                                className={cn(
                                                    'w-full rounded-lg border p-3 text-left transition-colors',
                                                    selectedDoctorId === doctor.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'hover:bg-accent'
                                                )}
                                            >
                                                <div className='flex items-start gap-3'>
                                                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                                                        {doctor.profileImage ? (
                                                            <img
                                                                src={doctor.profileImage}
                                                                alt={doctor.fullName}
                                                                className='h-10 w-10 rounded-full object-cover'
                                                            />
                                                        ) : (
                                                            <User className='h-5 w-5 text-primary' />
                                                        )}
                                                    </div>
                                                    <div className='min-w-0 flex-1'>
                                                        <div className='truncate font-medium'>
                                                            {doctor.fullName}
                                                        </div>
                                                        <div className='truncate text-xs text-muted-foreground'>
                                                            {doctor.position}
                                                        </div>
                                                        {doctor.departmentName && (
                                                            <div className='truncate text-xs text-muted-foreground'>
                                                                {doctor.departmentName}
                                                            </div>
                                                        )}
                                                        <div className='mt-1'>
                                                            <Badge
                                                                variant={
                                                                    doctor.available ? 'default' : 'secondary'
                                                                }
                                                                className='text-xs'
                                                            >
                                                                {doctor.available
                                                                    ? 'Đang làm'
                                                                    : 'Không có lịch'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <div className='py-8 text-center text-sm text-muted-foreground'>
                                        {searchTerm ? 'Không tìm thấy bác sĩ' : 'Không có bác sĩ'}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </>
            )}
        </div>
    )
}
