import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { searchPatients, type Patient } from '../api/patients'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PatientSearchProps {
  value?: Patient | null
  onSelect: (patient: Patient) => void
  onCreateNew: () => void
  disabled?: boolean
}

export function PatientSearch({
  value,
  onSelect,
  onCreateNew,
  disabled,
}: PatientSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)

  const fetchPatients = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setPatients([])
      return
    }

    setIsLoading(true)
    try {
      const results = await searchPatients(query)
      setPatients(results)
    } catch (error) {
      console.error('Error searching patients:', error)
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPatients(debouncedSearch)
  }, [debouncedSearch, fetchPatients])

  const handleSelect = (patient: Patient) => {
    onSelect(patient)
    setOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between"
            disabled={disabled}
          >
            {value ? (
              <span className="truncate">
                {value.name} - {value.phone || 'Không có SĐT'}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Tìm bệnh nhân theo tên hoặc SĐT...
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Nhập tên hoặc số điện thoại..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Đang tìm kiếm...
                </div>
              ) : patients.length === 0 && debouncedSearch.length >= 2 ? (
                <CommandEmpty>
                  <div className="py-2 text-center text-sm">
                    <p className="text-muted-foreground mb-2">
                      Không tìm thấy bệnh nhân
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOpen(false)
                        onCreateNew()
                      }}
                      className="mx-auto"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Tạo bệnh nhân mới
                    </Button>
                  </div>
                </CommandEmpty>
              ) : patients.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Nhập tối thiểu 2 ký tự để tìm kiếm
                </div>
              ) : (
                <CommandGroup>
                  {patients.map((patient) => (
                    <CommandItem
                      key={patient.id}
                      value={patient.id.toString()}
                      onSelect={() => handleSelect(patient)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{patient.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {patient.phone || 'Không có SĐT'} •{' '}
                          {patient.gender === 'NAM' ? 'Nam' : 'Nữ'} •{' '}
                          {patient.birth}
                        </span>
                      </div>
                      <Check
                        className={cn(
                          'h-4 w-4',
                          value?.id === patient.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onCreateNew}
        disabled={disabled}
        title="Tạo bệnh nhân mới"
      >
        <UserPlus className="h-4 w-4" />
      </Button>
    </div>
  )
}
