import { useState, useEffect } from 'react'
import { FilterIcon, XIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
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
import { useDebounce } from '@/hooks/use-debounce'
import { fetchDepartments } from '../api/departments'
import { fetchDegrees } from '../api/degrees'
import type { DoctorFilters } from '../types'

interface DoctorFiltersProps {
    filters: DoctorFilters
    onFiltersChange: (filters: DoctorFilters) => void
    onReset: () => void
}

export function DoctorFiltersComponent({ filters, onFiltersChange, onReset }: DoctorFiltersProps) {
    // Local state for keyword input (before debounce)
    const [keywordInput, setKeywordInput] = useState(filters.keyword || '')

    // Debounce keyword input (500ms delay)
    const debouncedKeyword = useDebounce(keywordInput, 500)

    // Fetch departments
    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: fetchDepartments,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Fetch degrees
    const { data: degrees = [] } = useQuery({
        queryKey: ['degrees'],
        queryFn: fetchDegrees,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

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

    const handleDepartmentChange = (value: string) => {
        onFiltersChange({
            ...filters,
            departmentId: value === 'all' ? undefined : parseInt(value)
        })
    }

    const handleDegreeChange = (value: string) => {
        onFiltersChange({
            ...filters,
            degreeId: value === 'all' ? undefined : parseInt(value)
        })
    }

    const hasActiveFilters =
        filters.keyword ||
        filters.departmentId ||
        filters.degreeId

    console.log('🔵 [DoctorFiltersComponent] departments:', departments)
    console.log('🔵 [DoctorFiltersComponent] degrees:', degrees)

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <FilterIcon className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Bộ lọc</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <div className="grid gap-3 grid-cols-1 md:grid-cols-3 flex-1">
                    {/* Keyword search */}
                    <div className="space-y-2">
                        <Label htmlFor="keyword">Tìm kiếm</Label>
                        <Input
                            id="keyword"
                            placeholder="Tên bác sĩ..."
                            value={keywordInput}
                            onChange={(e) => handleKeywordChange(e.target.value)}
                        />
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label htmlFor="department">Khoa</Label>
                        <Select
                            value={filters.departmentId?.toString() || 'all'}
                            onValueChange={handleDepartmentChange}
                        >
                            <SelectTrigger id="department">
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Degree */}
                    <div className="space-y-2">
                        <Label htmlFor="degree">Bằng cấp</Label>
                        <Select
                            value={filters.degreeId?.toString() || 'all'}
                            onValueChange={handleDegreeChange}
                        >
                            <SelectTrigger id="degree">
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {degrees.map((degree) => (
                                    <SelectItem key={degree.degreeId} value={degree.degreeId.toString()}>
                                        {degree.degreeName}
                                    </SelectItem>
                                ))}
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
