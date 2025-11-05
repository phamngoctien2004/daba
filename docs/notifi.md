/api/users/notifications GET
response
{
    "data": {
        "notifications": [
            {
                "id": 1,
                "title": "Bệnh nhânTien dep trai đã đặt lịch khám ",
                "time": "2025-11-04T20:28:15",
                "isUserRead": false,
                "isAdminRead": true,
                "receiverId": 4,
                "typeId": 75,
                "type": "DAT_LICH"
            }
        ],
        "unreadCount": 1
    },
    "message": "Fetched user notifications successfully"
}
Đây là  socket để nhận thông báo mới nhất 
template.convertAndSend("/topic/notifications/book." + id, saved);
(saved có nội dung giống hệt 1 đối tượng trong notifications)
/api/users/notifications/mark-as-read POST
khi người dùng bấm vào chuông gọi api 
không có response