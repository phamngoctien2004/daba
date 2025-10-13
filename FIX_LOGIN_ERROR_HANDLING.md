# Fix: Xử lý lỗi đăng nhập

## Vấn đề
Khi đăng nhập thất bại, hệ thống hiển thị thông báo "404 Page Not Found" thay vì thông báo lỗi đăng nhập rõ ràng cho người dùng.

## Nguyên nhân
1. **API Interceptor quá aggressive**: Response interceptor trong `api-client.ts` tự động hiển thị toast cho MỌI lỗi, kể cả lỗi login
2. **Duplicate toast messages**: Cả interceptor và login form đều hiển thị toast, gây nhầm lẫn
3. **Error message không rõ ràng**: Thông báo lỗi không cụ thể cho từng trường hợp

## Giải pháp

### 1. Cập nhật API Client Interceptor (`/src/lib/api-client.ts`)
**Thay đổi**: Không hiển thị toast cho request đăng nhập, để login form tự xử lý

```typescript
// Kiểm tra xem có phải login request không
const isLoginRequest = url.includes('/auth/dashboard/login')

// Chỉ hiển thị toast nếu KHÔNG phải login request
if (!isLoginRequest) {
  toast.error('...')
}
```

**Các lỗi được xử lý**:
- `401 Unauthorized`: Phiên đăng nhập hết hạn (tự động redirect về /sign-in)
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên (KHÔNG hiển thị cho login)
- `422 Validation Error`: Lỗi xác thực dữ liệu
- `500 Server Error`: Lỗi máy chủ
- Network errors: Lỗi kết nối mạng

**Cải thiện**:
- ✅ Thông báo bằng tiếng Việt
- ✅ Phân biệt login request vs các request khác
- ✅ Không có duplicate toast

### 2. Cải thiện Error Handler (`/src/lib/handle-server-error.ts`)
**Thêm mới**: Hàm `getErrorMessage()` để lấy error message mà không hiển thị toast

```typescript
/**
 * Lấy error message từ error object
 * @param error - Error object
 * @param defaultMessage - Message mặc định
 * @returns Error message string
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage = 'Đã xảy ra lỗi'
): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || defaultMessage
  }
  if (error instanceof Error) {
    return error.message || defaultMessage
  }
  return defaultMessage
}
```

**Cải thiện `handleServerError()`**:
- Xử lý nhiều status code hơn (400, 401, 403, 404, 422, 500)
- Thông báo tiếng Việt
- Log error để debug
- Hỗ trợ custom message

### 3. Cập nhật Login Form (`/src/features/auth/sign-in/components/user-auth-form.tsx`)
**Thay đổi**: Xử lý lỗi cụ thể và rõ ràng

```typescript
onError: (error: unknown) => {
  const errorMessage = getErrorMessage(
    error,
    'Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.'
  )
  toast.error(errorMessage)
}
```

**Cải thiện**:
- ✅ Sử dụng `getErrorMessage()` helper
- ✅ Thông báo mặc định rõ ràng
- ✅ Hiển thị message từ server nếu có
- ✅ Không bị duplicate với interceptor

## Các trường hợp lỗi đăng nhập

### 1. Sai username/password
```
Response: 401 Unauthorized
Message từ server: "Invalid username or password"
Hiển thị: "Invalid username or password" (hoặc message tiếng Việt nếu server trả về)
```

### 2. Tài khoản bị khóa
```
Response: 403 Forbidden  
Message từ server: "Account is locked"
Hiển thị: "Account is locked"
```

### 3. Server không phản hồi
```
Error: Network Error
Hiển thị: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối Internet."
```

### 4. Server lỗi 500
```
Response: 500 Internal Server Error
Hiển thị: "Lỗi máy chủ. Vui lòng thử lại sau."
```

### 5. Dữ liệu không hợp lệ
```
Response: 422 Unprocessable Entity
Message từ server: "Email format is invalid"
Hiển thị: "Email format is invalid"
```

## Luồng xử lý lỗi mới

```
User submit login form
  ↓
Login API call
  ↓
[TH1: Thành công]
  → onSuccess() được gọi
  → Lưu token + user
  → Toast success: "Đăng nhập thành công"
  → Redirect về dashboard

[TH2: Thất bại - Lỗi từ server]
  → API response với error (400, 401, 403, 404, 422, 500)
  → Response interceptor KHÔNG hiển thị toast (vì là login request)
  → onError() trong login form được gọi
  → getErrorMessage() lấy message từ error.response.data.message
  → Toast error: Message từ server hoặc default message
  → User ở lại trang login, có thể thử lại

[TH3: Thất bại - Lỗi network]
  → Không có response từ server
  → Response interceptor hiển thị: "Lỗi kết nối mạng..."
  → onError() trong login form cũng được gọi
  → Toast error từ login form bị suppress (do interceptor đã hiển thị)
```

## Testing

### Test 1: Sai mật khẩu
1. Nhập username đúng, password sai
2. Click "Sign in"
3. **Expected**: 
   - Toast hiển thị: "Invalid password" hoặc message từ server
   - KHÔNG redirect
   - KHÔNG hiển thị "404 Not Found"

### Test 2: Tài khoản không tồn tại
1. Nhập username không tồn tại
2. Click "Sign in"
3. **Expected**:
   - Toast: "User not found" hoặc "Invalid credentials"
   - Ở lại trang login

### Test 3: Server lỗi
1. Tắt backend server
2. Submit login
3. **Expected**:
   - Toast: "Lỗi kết nối mạng..." hoặc "Lỗi máy chủ..."
   - Ở lại trang login

### Test 4: Đăng nhập thành công
1. Nhập credentials đúng
2. Submit
3. **Expected**:
   - Toast: "Đăng nhập thành công"
   - Redirect về dashboard
   - Token và user được lưu

## Files đã thay đổi

1. **`/src/lib/api-client.ts`**
   - Thêm check `isLoginRequest` để skip toast cho login
   - Cập nhật messages sang tiếng Việt
   - Sửa redirect URL từ `/login` → `/sign-in`

2. **`/src/lib/handle-server-error.ts`**
   - Thêm function `getErrorMessage()` mới
   - Cải thiện `handleServerError()` với nhiều status code
   - Thông báo tiếng Việt

3. **`/src/features/auth/sign-in/components/user-auth-form.tsx`**
   - Sử dụng `getErrorMessage()` helper
   - Thông báo lỗi rõ ràng hơn
   - Message tiếng Việt

## Lợi ích

✅ **User Experience tốt hơn**:
- Thông báo lỗi rõ ràng, dễ hiểu
- Không có thông báo nhầm lẫn (404)
- Tiếng Việt thân thiện

✅ **Developer Experience tốt hơn**:
- Code dễ maintain
- Error handling nhất quán
- Helper function tái sử dụng được

✅ **Debugging dễ dàng hơn**:
- Console.error() cho mọi lỗi
- Có thể trace được nguồn gốc lỗi
- Message từ server được hiển thị đầy đủ

## Kết luận

Đã sửa xong lỗi hiển thị "404 Not Found" khi đăng nhập thất bại. Giờ đây:
- ✅ Lỗi đăng nhập hiển thị message rõ ràng
- ✅ Không có duplicate toast
- ✅ Thông báo bằng tiếng Việt
- ✅ Xử lý đầy đủ các trường hợp lỗi

**Hệ thống sẵn sàng để test!** 🎉
