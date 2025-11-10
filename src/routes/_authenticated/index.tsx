import { createFileRoute, redirect } from '@tanstack/react-router'
import { getUserData } from '@/lib/auth-storage'
import { type User } from '@/types/auth'

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: async () => {
    const user = getUserData<User>()

    if (!user) {
      throw redirect({
        to: '/appointments',
      })
    }

    // Redirect based on user role
    switch (user.role) {
      case 'LE_TAN':
        throw redirect({ to: '/appointments' })
      case 'BAC_SI':
        throw redirect({ to: '/doctor-medical-records' })
      case 'ADMIN':
        throw redirect({ to: '/admin/reports' })
      default:
        throw redirect({ to: '/appointments' })
    }
  },
})
