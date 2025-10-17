import { createFileRoute } from '@tanstack/react-router'
import { LabOrdersManagement } from '@/features/lab-orders'

export const Route = createFileRoute('/_authenticated/lab-orders/')({
  component: LabOrdersComponent,
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

function LabOrdersComponent() {
  return <LabOrdersManagement />
}
