1. Load thêm tin nhắn cũ
- /api/conversations/1/messages/more?beforeId=3
{
    "data": {
        "messages": [
            {
                "id:1,
                "conversationId": 1,
                "senderId": 3,
                "message": "tao đẹp trai không",
                "sentTime": "2025-10-26T16:06:34",
                "urls": []
            },
            {
                "id:2,
                "conversationId": 1,
                "senderId": 1,
                "message": "ê",
                "sentTime": "2025-10-26T16:06:25",
                "urls": []
            }
        ],
        "lastReadId": 0,
        "totalUnread": 0,
        "totalMessage": 0,
        "hasMoreOld": true
    },
    "message": "Lấy thêm tin nhắn thành công"
}

2. Lấy lịch sử cuộc trò chuyện
- mô tả: dựa vào tin nhắn chưa đọc của người dùng biết được scroll tin nhắn ở đâu
đã đọc ở đâu
/api/conversations/1/messages
{
    "data": {
        "messages": [
            {
                "id:1,
                "conversationId": 1,
                "senderId": 1,
                "message": "ê",
                "sentTime": "2025-10-26T16:06:25",
                "urls": []
            },
            {
                 "id:2,
                "conversationId": 1,
                "senderId": 3,
                "message": "tao đẹp trai không",
                "sentTime": "2025-10-26T16:06:34",
                "urls": []
            },
            {
                "conversationId": 1,
                "senderId": 1,
                "message": "có đẹp trai lắm anh",
                "sentTime": "2025-10-26T16:06:40",
                "urls": []
            },
            {
                "conversationId": 1,
                "senderId": 1,
                "message": "ê",
                "sentTime": "2025-10-26T16:08:40",
                "urls": []
            },
            {
                "conversationId": 1,
                "senderId": 1,
                "message": "này cu",
                "sentTime": "2025-10-26T16:08:41",
                "urls": []
            },
            {
                "conversationId": 1,
                "senderId": 1,
                "message": "tao",
                "sentTime": "2025-10-26T16:08:42",
                "urls": []
            },
            {
                "conversationId": 1,
                "senderId": 1,
                "message": "thì",
                "sentTime": "2025-10-26T16:08:43",
                "urls": []
            },
            {
                "conversationId": 1,
                "senderId": 1,
                "message": "làm sao",
                "sentTime": "2025-10-26T16:08:45",
                "urls": []
            },
            {
                "conversationId": 1,
                "senderId": 1,
                "message": "đụ mẹ",
                "sentTime": "2025-10-26T16:08:46",
                "urls": []
            },
            {
                "conversationId": 1,
                "senderId": 1,
                "message": "mày",
                "sentTime": "2025-10-26T16:08:47",
                "urls": []
            },
            {
                "conversationId": 1,
                "senderId": 1,
                "message": "thằng c",
                "sentTime": "2025-10-26T16:08:48",
                "urls": []
            },
            {
                "conversationId": 1,
                "senderId": 1,
                "message": "chó chết",
                "sentTime": "2025-10-26T16:08:50",
                "urls": []
            },
            {
                "conversationId": 1,
                "senderId": 3,
                "message": "",
                "sentTime": "2025-10-26T16:24:34",
                "urls": [
                    "https://files.tienpndev.id.vn/phongkham/chat/97315e28-d691-4afd-b207-006f033898ca.jpeg"
                ]
            },
            {
                "conversationId": 1,
                "senderId": 3,
                "message": "ăn cứt",
                "sentTime": "2025-10-26T16:24:49",
                "urls": [
                    "https://files.tienpndev.id.vn/phongkham/chat/79d64ee1-dc25-4377-9251-5390bc3b8fe5.jpeg"
                ]
            },
            {
                "conversationId": 1,
                "senderId": 3,
                "message": "đụ mẹ mạnh béo",
                "sentTime": "2025-10-26T16:27:43",
                "urls": [
                    "https://files.tienpndev.id.vn/phongkham/chat/4bcf516a-1882-45ee-9e9b-6ed90d9b9e0e.png"
                ]
            },
            {
                "conversationId": 1,
                "senderId": 3,
                "message": "con chó tuấn em",
                "sentTime": "2025-10-26T16:32:11",
                "urls": [
                    "https://files.tienpndev.id.vn/phongkham/chat/c4c88a77-51fc-4f6a-a31e-9d16052098e6.jpeg"
                ]
            },
            {
                "conversationId": 1,
                "senderId": 3,
                "message": "",
                "sentTime": "2025-10-26T16:32:38",
                "urls": [
                    "https://files.tienpndev.id.vn/phongkham/chat/e602f258-89a0-48f5-8b2e-70fd158bfb94.jpeg"
                ]
            }
        ],
        "lastReadId": 18,
        "totalUnread": 0,
        "totalMessage": 18,
        "hasMoreOld": false
    },
    "message": "Lấy lịch sử trò chuyện thành công"
}



3. Lấy tất cả phòng chat của người dùng 
GET /api/conversations
{
    "data": [
        {
            "id": "1",
            "patientName": "Phạm Ngọc Tiến - 0395527082",
            "responder": "LE_TAN",
            "newMessage": false
        }
    ],
    "message": "Lấy danh sách cuộc trò chuyện thành công"
}
Nếu role là người dùng thì hiển thị tiêu đề đoạn chat là Nhân viên tư vấn
Nếu là lễ tân thì title là patientName


4. Gửi tin nhắn
    @MessageMapping("/chat.send")

    request:"
    public class MessageDTO {
    private Integer conversationId;
    private Integer senderId;
    private String message;
    private LocalDateTime sentTime;
    private List<String> urls;
}
"

messagingTemplate.convertAndSend(
                    "/topic/chat/" + newMessage.getConversationId(),
                    newMessage);


