import { createFileRoute } from '@tanstack/react-router'
import { MedicalRecordsManagement } from '@/features/medical-records/index'

export const Route = createFileRoute('/_authenticated/medical-records/')({
    component: MedicalRecordsComponent,
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

function MedicalRecordsComponent() {
    return <MedicalRecordsManagement />
}
