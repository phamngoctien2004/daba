# 🔔 Real-time Notification Troubleshooting Guide

## Vấn đề hiện tại
Khi người dùng đặt lịch, server push notification tới `/topic/notifications/book.{userId}` nhưng badge đỏ không hiển thị real-time, phải F5 mới thấy.

## ✅ Đã cải thiện

### 1. Aggressive Refetch Strategy
```typescript
// useNotifications hook
refetchInterval: 10000,  // 10s thay vì 30s
staleTime: 5000,         // 5s thay vì 20s
refetchOnWindowFocus: true,
refetchOnMount: true,
```

### 2. Force Refetch khi nhận WebSocket
```typescript
// Khi nhận notification qua WebSocket:
queryClient.invalidateQueries({ 
  queryKey: ['notifications'],
  refetchType: 'active'
})

queryClient.refetchQueries({
  queryKey: ['notifications'],
  type: 'active'
})
```

### 3. Thêm Debug Logs
- ✅ Log khi subscribe topic
- ✅ Log khi nhận notification
- ✅ Log data trước/sau invalidate
- ✅ Log render component với unreadCount

## 🧪 Cách test

### Bước 1: Mở Console Browser
```
F12 → Console tab
```

### Bước 2: Kiểm tra WebSocket Connection
Tìm log:
```
✅ [WebSocket] Connected successfully
🔵 [WebSocket] Subscribing to /topic/notifications/book.{userId}
✅ [Notifications] Subscription setup completed
```

### Bước 3: Test đặt lịch
1. Người dùng đặt lịch từ app khác/tab khác
2. Kiểm tra console có log:
   ```
   ✅ [WebSocket] Received notification from /topic/notifications/book.X: {...}
   ✅ [Notifications] Received new notification: {...}
   ✅ [Notifications] Query invalidated and refetching...
   🔔 [NotificationDropdown] Render: { unreadCount: X, ... }
   ```

### Bước 4: Verify Badge
- Badge đỏ phải xuất hiện **ngay lập tức** (trong 1-2 giây)
- Số hiển thị phải tăng (vd: 0 → 1, hoặc 1 → 2)

## 🔍 Debug Checklist

### ❌ Nếu không nhận được notification

**1. Kiểm tra WebSocket connected**
```javascript
// Console
wsClient.isConnected()  // phải return true
```

**2. Kiểm tra user ID đúng**
```javascript
// Console log phải có:
🔵 [Notifications] Subscribing to /topic/notifications/book.{ID}
```
- ID phải khớp với `receiverId` trong API response

**3. Kiểm tra server push đúng topic**
Backend phải push tới:
```java
template.convertAndSend("/topic/notifications/book." + receiverId, saved);
```
- `receiverId` là ID của admin, **KHÔNG phải** ID của người dùng đặt lịch

**4. Kiểm tra CORS & WebSocket endpoint**
```
WS_BASE_URL = http://localhost:8080/ws
```

### ❌ Nếu nhận được log nhưng badge không update

**1. React Query cache issue**
```javascript
// Console check
queryClient.getQueryData(['notifications'])
```

**2. Component không re-render**
Kiểm tra log:
```
🔔 [NotificationDropdown] Render: ...
```
Phải thấy log này sau khi nhận notification

**3. Data structure mismatch**
Kiểm tra response format:
```json
{
  "data": {
    "notifications": [...],
    "unreadCount": 1  // ← phải có field này
  }
}
```

## 🚀 Expected Behavior (Sau khi fix)

### Timeline khi người dùng đặt lịch:

```
T+0s:   Người dùng submit form đặt lịch
T+0.5s: Server xử lý và push WebSocket
        → template.convertAndSend("/topic/notifications/book.4", saved)

T+0.6s: Admin app nhận WebSocket message
        → Console log: ✅ [WebSocket] Received notification

T+0.7s: React Query invalidate & refetch
        → Console log: ✅ [Notifications] Query invalidated

T+0.8s: API GET /api/users/notifications được gọi
        → Response: { unreadCount: X }

T+0.9s: Component re-render với unreadCount mới
        → Console log: 🔔 [NotificationDropdown] Render

T+1.0s: ✅ Badge đỏ xuất hiện với số đúng!
```

**Total time: ~1 second (không cần F5)**

## 📝 Notes

### Fallback: Polling mỗi 10 giây
Nếu WebSocket fail, vẫn có polling backup:
```typescript
refetchInterval: 10000  // Auto refetch mỗi 10s
```

### Browser Notification (Optional)
Nếu user cho phép, sẽ có popup notification:
```javascript
// Request permission
requestNotificationPermission()
```

### Production Tips
1. **Giảm refetchInterval** xuống 5s nếu traffic cao
2. **Tắt debug logs** trong production
3. **Monitor WebSocket reconnection** nếu connection drop

## 🐛 Known Issues

### Issue: Badge không clear sau khi click
**Fix:** Đã implement `handleOpenChange` để auto mark as read

### Issue: Multiple subscriptions
**Fix:** WebSocket client dùng `topicCallbacks` để prevent duplicate subscriptions

### Issue: Memory leak
**Fix:** Cleanup function trong useEffect để unsubscribe khi unmount
