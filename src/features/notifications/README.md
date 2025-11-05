# Notification System

Hệ thống thông báo real-time cho admin khi có người dùng đặt lịch khám.

## Tính năng

- ✅ **Real-time notifications** qua WebSocket
- ✅ **Badge hiển thị số lượng** thông báo chưa đọc
- ✅ **Auto-refetch** mỗi 30 giây
- ✅ **Mark as read** tự động khi mở dropdown
- ✅ **Browser notifications** (nếu được cấp quyền)
- ✅ **Vietnamese datetime** formatting

## API Endpoints

### GET `/api/users/notifications`
Lấy danh sách thông báo và số lượng chưa đọc.

**Response:**
```json
{
  "data": {
    "notifications": [
      {
        "id": 1,
        "title": "Bệnh nhân Tien đẹp trai đã đặt lịch khám",
        "time": "2025-11-04T20:28:15",
        "isUserRead": false,
        "isAdminRead": false,
        "receiverId": 4,
        "typeId": 75,
        "type": "DAT_LICH"
      }
    ],
    "unreadCount": 1
  },
  "message": "Fetched user notifications successfully"
}
```

### POST `/api/users/notifications/mark-as-read`
Đánh dấu tất cả thông báo đã đọc.

## WebSocket

**Topic:** `/topic/notifications/book.{userId}`

Khi có thông báo mới, server sẽ push message với cấu trúc giống object trong `notifications` array.

## Sử dụng

### 1. Thêm vào Header (Recommended)

Sử dụng `HeaderActions` component đã bao gồm notification button:

```tsx
import { Header } from '@/components/layout/header'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search as GlobalSearch } from '@/components/search'

export function MyPage() {
  return (
    <Header fixed>
      <GlobalSearch />
      <HeaderActions />
    </Header>
  )
}
```

### 2. Thêm riêng lẻ

```tsx
import { NotificationDropdown } from '@/features/notifications'

export function MyHeader() {
  return (
    <div className='flex items-center gap-1'>
      <NotificationDropdown />
      <ProfileDropdown />
    </div>
  )
}
```

### 3. Real-time Subscription

WebSocket subscription được tự động kích hoạt trong `AuthenticatedLayout`, không cần thêm code.

Nếu muốn sử dụng ở nơi khác:

```tsx
import { useNotificationSubscription } from '@/features/notifications'

export function MyComponent() {
  useNotificationSubscription() // Auto connect & subscribe
  return <div>...</div>
}
```

## Cấu trúc Code

```
src/features/notifications/
├── api/
│   └── notifications.ts          # API client (fetch, markAsRead)
├── components/
│   └── notification-dropdown.tsx # UI component
├── hooks/
│   ├── use-notifications.ts      # React Query hooks
│   └── use-notification-subscription.ts # WebSocket subscription
├── types.ts                      # TypeScript interfaces
└── index.ts                      # Exports
```

## Logic xử lý

### Badge hiển thị
- Badge chỉ hiển thị khi `unreadCount > 0`
- Số hiển thị: `99+` nếu `unreadCount > 99`, ngược lại hiển thị số thực

### Đánh dấu đã đọc
- **Tự động**: Khi mở dropdown (trigger `onOpenChange`)
- **Thủ công**: Click nút "Đánh dấu tất cả đã đọc"

### Hiển thị thông báo chưa đọc
- Các notification có `isAdminRead = false` sẽ:
  - Có background màu `bg-accent/50`
  - Font chữ **bold**
  - Có dot màu xanh ở góc phải

### Browser Notification
Để bật browser notification, thêm vào app initialization:

```tsx
import { requestNotificationPermission } from '@/features/notifications'

// Trong useEffect hoặc component mount
useEffect(() => {
  requestNotificationPermission()
}, [])
```

## Notification Types

```typescript
type NotificationType = 'DAT_LICH' | 'HUY_LICH' | 'XAC_NHAN_LICH' | 'KHAC'
```

- 📅 `DAT_LICH` - Người dùng đặt lịch mới
- ❌ `HUY_LICH` - Người dùng hủy lịch
- ✅ `XAC_NHAN_LICH` - Admin xác nhận lịch
- 🔔 `KHAC` - Loại khác

## Troubleshooting

### Không nhận được thông báo real-time
1. Kiểm tra WebSocket đã connect: Check console logs `🔵 [WebSocket]`
2. Kiểm tra `user.id` có tồn tại trong auth store
3. Kiểm tra topic đúng format: `/topic/notifications/book.{userId}`

### Badge không cập nhật
1. React Query đang cache data, chờ 30s hoặc reload page
2. Check API response có trả về `unreadCount` đúng format

### Component không build
1. Kiểm tra đã install `date-fns`: `pnpm add date-fns`
2. Kiểm tra các shadcn components: `Badge`, `ScrollArea`, `DropdownMenu`
