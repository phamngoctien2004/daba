import { createFileRoute } from '@tanstack/react-router'
import { DoctorMedicalRecordsManagement } from '@/features/medical-records/doctor-index'

export const Route = createFileRoute('/_authenticated/doctor-medical-records/')({
  component: DoctorMedicalRecordsComponent,
  errorComponent: ({ error }) => {
    console.error('Route error:', error)
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-destructive'>Có lỗi xảy ra</h1>
          <p className='mt-2 text-muted-foreground'>{error.message}</p>
        </div>
      </div>
    )
  },
})

function DoctorMedicalRecordsComponent() {
  return <DoctorMedicalRecordsManagement />
}
