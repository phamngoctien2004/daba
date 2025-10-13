import { AxiosError } from 'axios'
import { toast } from 'sonner'

const logServerError = (error: unknown) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error('Server error:', error)
  }
}

/**
 * Handle server errors and display appropriate toast messages
 * @param error - The error object from API call
 * @param customMessage - Optional custom error message
 */
export function handleServerError(error: unknown, customMessage?: string) {
  logServerError(error)

  let errMsg = customMessage || 'Đã xảy ra lỗi!'

  // Handle 204 No Content
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Không tìm thấy nội dung.'
  }

  // Handle Axios errors
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    switch (status) {
      case 400:
        errMsg = message || 'Yêu cầu không hợp lệ.'
        break
      case 401:
        errMsg = message || 'Chưa xác thực. Vui lòng đăng nhập.'
        break
      case 403:
        errMsg = message || 'Không có quyền truy cập.'
        break
      case 404:
        errMsg = message || 'Không tìm thấy tài nguyên.'
        break
      case 422:
        errMsg = message || 'Dữ liệu không hợp lệ.'
        break
      case 500:
        errMsg = message || 'Lỗi máy chủ nội bộ.'
        break
      default:
        errMsg = message || 'Đã xảy ra lỗi không mong muốn.'
    }
  }

  toast.error(errMsg)
  return errMsg
}

/**
 * Extract error message from error object without showing toast
 * @param error - The error object
 * @param defaultMessage - Default message if no error message found
 * @returns Error message string
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage = 'Đã xảy ra lỗi'
): string {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message || error.message || defaultMessage
    )
  }

  if (error instanceof Error) {
    return error.message || defaultMessage
  }

  return defaultMessage
}
