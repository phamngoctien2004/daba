import { useCallback, useMemo, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery, type QueryKey } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { PatientsTable } from './components/patients-table-view'
import { CreatePatientDialog } from './components/create-patient-dialog'
import { EditPatientDialog } from './components/edit-patient-dialog'
import { PatientDetailDialog } from './components/patient-detail-dialog'
import { fetchPatients } from './api/patients'
import type { PatientsSearch, Patient } from './types'

const patientsRoute = getRouteApi('/_authenticated/admin/patients')
const patientsQueryBaseKey: QueryKey = ['admin-patients']

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const resolveKeyword = (value?: string | null) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function PatientsManagement() {
  const search = patientsRoute.useSearch() as PatientsSearch
  const navigate = patientsRoute.useNavigate()
  const globalNavigate = useNavigate()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // Debounce keyword to avoid excessive API calls
  const rawKeyword = resolveKeyword(search.keyword)
  const keywordFilter = useDebounce(rawKeyword, 500)

  const page = Math.max(1, search.page ?? DEFAULT_PAGE)
  const pageSize = Math.max(1, search.pageSize ?? DEFAULT_PAGE_SIZE)

  const queryInput = useMemo(
    () => ({
      keyword: keywordFilter,
      page,
      limit: pageSize,
    }),
    [keywordFilter, page, pageSize]
  )

  const patientsQuery = useQuery({
    queryKey: [...patientsQueryBaseKey, queryInput],
    queryFn: () => fetchPatients(queryInput),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  })

  const patients = patientsQuery.data?.patients ?? []
  const pagination = patientsQuery.data?.pagination ?? {
    page,
    pageSize,
    total: patients.length,
    totalPages: patients.length > 0 ? 1 : 0,
  }

  const isLoading = patientsQuery.isPending
  const isRefetching = patientsQuery.isFetching && !patientsQuery.isPending

  const handleResetFilters = useCallback(() => {
    navigate({
      search: () => ({}),
    })
  }, [navigate])

  const handleViewDetail = useCallback(
    (id: number) => {
      const patient = patients.find((p) => p.id === id)
      if (patient) {
        setSelectedPatient(patient)
        setDetailDialogOpen(true)
      }
    },
    [patients]
  )

  const handleEdit = useCallback(
    (id: number) => {
      const patient = patients.find((p) => p.id === id)
      if (patient) {
        setSelectedPatient(patient)
        setEditDialogOpen(true)
      }
    },
    [patients]
  )

  const handleDelete = useCallback(
    (id: number) => {
      // TODO: Implement delete functionality
      console.log('Delete patient:', id)
    },
    []
  )

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Quản lý bệnh nhân</h2>
          <p className='text-muted-foreground'>
            Theo dõi và quản lý thông tin bệnh nhân.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          Thêm bệnh nhân
        </Button>
      </div>

      <PatientsTable
        data={patients}
        total={pagination.total}
        pageCount={pagination.totalPages}
        isLoading={isLoading}
        isRefetching={isRefetching}
        onViewDetail={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetFilters={handleResetFilters}
        search={search}
        navigate={navigate as NavigateFn}
      />

      <CreatePatientDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditPatientDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        patient={selectedPatient}
      />

      <PatientDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        patientId={selectedPatient?.id ?? null}
      />
    </>
  )
}
