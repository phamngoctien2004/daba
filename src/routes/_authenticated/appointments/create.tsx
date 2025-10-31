import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { CreateAppointmentForm } from '@/features/appointments/components/create-appointment-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/appointments/create')({
  component: CreateAppointmentPage,
})

function CreateAppointmentPage() {
  const navigate = useNavigate()

  // Memoize callbacks to prevent unnecessary re-renders of CreateAppointmentForm
  const handleSuccess = useCallback(() => {
    // Navigate back to appointments list after successful creation
    navigate({ to: '/appointments' })
  }, [navigate])

  const handleCancel = useCallback(() => {
    navigate({ to: '/appointments' })
  }, [navigate])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/appointments' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đặt lịch khám</h1>
          <p className="text-muted-foreground">
            Tạo lịch hẹn khám bệnh cho bệnh nhân
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin đặt lịch</CardTitle>
          <CardDescription>
            Vui lòng điền đầy đủ thông tin để đặt lịch khám cho bệnh nhân
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAppointmentForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
