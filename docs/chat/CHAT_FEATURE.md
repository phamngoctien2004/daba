# Chức năng Chat - Messenger Style

## 📋 Tổng quan
Chức năng chat được xây dựng với giao diện tương tự Facebook Messenger, sử dụng WebSocket (STOMP) để nhắn tin real-time.

## 🎯 Tính năng chính

### 1. **Danh sách cuộc trò chuyện (ConversationList)**
- Hiển thị tất cả cuộc trò chuyện của người dùng
- Avatar, tên người nhắn, tin nhắn cuối cùng
- Badge hiển thị số tin nhắn chưa đọc
- Thời gian tin nhắn (Hôm nay, Hôm qua, hoặc ngày cụ thể)
- Active state cho cuộc trò chuyện đang mở

### 2. **Cửa sổ chat (ChatWindow)**
- Header hiển thị thông tin người chat
- Trạng thái online/offline
- Danh sách tin nhắn với scroll
- Input area để gửi tin nhắn

### 3. **Danh sách tin nhắn (MessageList)**
- Hiển thị tin nhắn theo thời gian
- Phân biệt tin nhắn gửi/nhận (bubble màu khác nhau)
- Auto-scroll khi có tin nhắn mới
- Load more khi scroll lên trên
- Hiển thị ngày tháng ngăn cách
- Hiển thị ảnh đính kèm (có thể click để xem)
- Giờ gửi tin nhắn

### 4. **Input tin nhắn (MessageInput)**
- Nút chọn ảnh (biểu tượng image)
- Upload ảnh ngay khi chọn (gọi API `/api/files/multiple` với type='chat')
- Hiển thị preview ảnh đã upload (80x80px, object-fit: cover)
- Có thể xóa từng ảnh đã upload
- Textarea để nhập tin nhắn (có thể để trống nếu có ảnh)
- Enter để gửi, Shift+Enter để xuống dòng
- Nút gửi tin nhắn (disabled khi không có nội dung và ảnh)

## 🛠️ Cấu trúc Files

```
src/
├── components/
│   └── Chat/
│       ├── ChatPage.jsx         # Component chat content (không có header/footer)
│       ├── ConversationList.jsx # Danh sách cuộc trò chuyện
│       ├── ChatWindow.jsx       # Cửa sổ chat
│       ├── MessageList.jsx      # Danh sách tin nhắn
│       ├── MessageInput.jsx     # Input nhập tin nhắn
│       ├── Chat.css            # Messenger-style CSS
│       └── index.js            # Export components
├── contexts/
│   └── ChatContext.jsx         # Context quản lý state chat
├── services/
│   ├── chatService.js         # API calls
│   └── websocketService.js    # WebSocket/STOMP handling
└── pages/
    └── ChatPage.jsx           # Page với Header + Footer
```

## 🔌 API Endpoints

### 1. Lấy danh sách conversations
```
GET /api/conversations
Response: {
  data: [
    {
      id: "1",
      patientName: "Phạm Ngọc Tiến - 0395527082",
      responder: "LE_TAN"
    }
  ]
}
```

### 2. Lấy lịch sử tin nhắn
```
GET /api/conversations/{conversationId}/messages
Response: {
  data: {
    messages: [...],
    lastReadId: 18,
    totalUnread: 0,
    totalMessage: 18,
    hasMoreOld: false
  }
}
```

### 3. Load thêm tin nhắn cũ
```
GET /api/conversations/{conversationId}/messages/more?beforeId={messageId}
Response: {
  data: {
    messages: [...],
    hasMoreOld: true
  }
}
```

### 4. Gửi tin nhắn (WebSocket)
```
Destination: /app/chat.send
Payload: {
  conversationId: 1,
  senderId: 3,
  message: "Hello",
  sentTime: "2025-10-26T16:06:34",
  urls: []
}
```

### 5. Gửi tin nhắn (WebSocket Subscribe)
```
Topic: /topic/chat/{conversationId}
Message: {
  conversationId: 1,
  senderId: 3,
  message: "Hello",
  sentTime: "2025-10-26T16:06:34",
  urls: []
}
```

### 6. Upload ảnh
```
POST /api/files/multiple
Content-Type: multipart/form-data
Body: 
  - files: File[] (mảng các file ảnh)
  - type: 'chat'

Response: {
  data: ["url1", "url2", "url3"]  // Mảng URL các ảnh đã upload
}
```

## 🎨 Styling - Messenger Theme

### Màu sắc chính
- **Primary Blue**: #0084ff (tin nhắn gửi)
- **Gray**: #e5e7eb (tin nhắn nhận)
- **Background**: #f0f2f5
- **Text**: #050505
- **Secondary Text**: #65676b
- **Green Online**: #31a24c

### Đặc điểm UI
- Border radius tròn (18px cho bubble, 50% cho avatar)
- Shadow nhẹ cho các card
- Hover effects mượt mà
- Animation khi tin nhắn xuất hiện
- Responsive design (mobile & desktop)
- **Ảnh preview**: 80x80px với object-fit: cover
- **Ảnh trong tin nhắn**: Grid layout, mỗi ảnh 150x150px với object-fit: cover
- Layout có Header và Footer giống các trang khác

## 📱 Responsive Design

### Desktop (> 768px)
- 2 cột: Conversation list (360px) + Chat window (flex 1)
- Full features

### Mobile (≤ 768px)
- Single column view
- Conversation list full width
- Chat window full width
- Ẩn conversation list khi chat active

## 🚀 Cách sử dụng

### 1. Import ChatProvider vào App
```jsx
import { ChatProvider } from './contexts/ChatContext';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        {/* Your routes */}
      </ChatProvider>
    </AuthProvider>
  );
}
```

### 2. Sử dụng trong component
```jsx
import { useChat } from '../../contexts/ChatContext';

function YourComponent() {
  const { 
    conversations, 
    activeConversation, 
    messages, 
    sendMessage,
    loadConversations 
  } = useChat();
  
  // Your logic here
}
```

### 3. Truy cập trang chat
```
URL: /chat
Hoặc click vào nút "Chat" trên Header (chỉ hiện khi đã login)
```

## ⚙️ Configuration

### WebSocket URL
Cấu hình trong `.env`:
```
VITE_WS_BASE_URL=http://localhost:8080
```

### API Base URL
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🔧 Tính năng nâng cao (Có thể thêm sau)

1. **Emoji Picker**: Thêm emoji vào tin nhắn
2. **Typing Indicator**: Hiển thị "đang nhập..."
3. **Read Receipts**: Đánh dấu đã đọc
4. **Voice Messages**: Ghi âm và gửi
5. **File Attachments**: Gửi file PDF, DOC, etc.
6. **Search Messages**: Tìm kiếm trong lịch sử chat
7. **Message Reactions**: React emoji vào tin nhắn
8. **Delete/Edit Messages**: Xóa/sửa tin nhắn đã gửi
9. **Group Chat**: Nhóm chat nhiều người
10. **Video Call**: Gọi video trực tiếp

## 🐛 Troubleshooting

### WebSocket không kết nối
- Kiểm tra VITE_WS_BASE_URL
- Đảm bảo backend WebSocket đang chạy
- Check console logs để xem lỗi

### Tin nhắn không gửi được
- Kiểm tra authentication token
- Verify conversationId và senderId
- Check network tab trong DevTools

### Ảnh không upload được
- Kiểm tra API endpoint `/chat/upload`
- Verify file size (< 5MB)
- Check file type (chỉ image/*)

## 📝 Notes

- Tin nhắn được lưu trên server, không lưu local
- WebSocket tự động reconnect khi mất kết nối
- Tin nhắn cũ được load on-demand (pagination)
- CSS độc lập, không ảnh hưởng các component khác
