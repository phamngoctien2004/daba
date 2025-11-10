import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { login as loginApi } from '@/lib/api/auth.api'
import { getErrorMessage } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

const formSchema = z.object({
  username: z.string().min(1, 'Please enter your username or email'),
  password: z.string().min(1, 'Please enter your password'),
})

type FormData = z.infer<typeof formSchema>

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      console.log('🟢 Login response:', response)
      const { accessToken, userResponse } = response.data
      console.log('🟢 User data:', userResponse)
      console.log('🟢 User role:', userResponse.role, 'Type:', typeof userResponse.role)

      // Store user and token in auth store
      login(userResponse, accessToken)

      toast.success(response.message || 'Đăng nhập thành công')

      // Redirect based on user role
      let targetPath = redirectTo
      if (!targetPath) {
        switch (userResponse.role) {
          case 'LE_TAN':
            targetPath = '/appointments' // Lễ tân -> Trang đặt lịch
            break
          case 'BAC_SI':
            targetPath = '/doctor-medical-records' // Bác sĩ -> Trang khám bệnh
            break
          case 'ADMIN':
            targetPath = '/admin/reports' // Admin -> Trang báo cáo thống kê
            break
          default:
            targetPath = '/appointments' // Mặc định -> Trang đặt lịch
        }
      }
      navigate({ to: targetPath, replace: true })
    },
    onError: (error: unknown) => {
      // Extract error message from API response
      const errorMessage = getErrorMessage(
        error,
        'Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.'
      )

      toast.error(errorMessage)
    },
  })

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email / Username</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={loginMutation.isPending}>
          {loginMutation.isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <LogIn />
          )}
          Sign in
        </Button>
      </form>
    </Form>
  )
}
