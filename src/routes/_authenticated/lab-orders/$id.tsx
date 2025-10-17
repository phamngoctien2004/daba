import { createFileRoute } from '@tanstack/react-router'
import { LabOrderDetail } from '@/features/lab-orders'

export const Route = createFileRoute('/_authenticated/lab-orders/$id')({
  component: LabOrderDetailComponent,
})

function LabOrderDetailComponent() {
  const { id } = Route.useParams()
  return <LabOrderDetail id={Number(id)} />
}
