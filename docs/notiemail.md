POST-/api/notifications
request 
{
	"title": "Ứu đãi tháng 11 từ phòng khám đa khoa thái hà",
    "content": "Từ ngày 9-11 đến cuối tháng 11 phòng khám có chương trình ưu đãi miễn phí khám bệnh khi đến phòng khám",
    "image":"https://..."
}

response
{
    "data": {
        "id": 5,
        "title": "Ứu đãi tháng 11 từ phòng khám đa khoa thái hà",
        "time": "2025-11-09T14:52:41.326961",
        "image": "https://avatar/asdfasd",
        "content": "Từ ngày 9-11 đến cuối tháng 11 phòng khám có chương trình ưu đãi miễn phí khám bệnh khi đến phòng khám",
    },
    "message": "Create notification successfully"
}
POST-/api/notifications
request 
{
    "id": 5
	"title": "Ứu đãi tháng 11 từ phòng khám đa khoa thái hà",
    "content": "Từ ngày 9-11 đến cuối tháng 11 phòng khám có chương trình ưu đãi miễn phí khám bệnh khi đến phòng khám",
    "image":"https://..."
}
response
{
    "data": {
        "id": 5,
        "title": "Ứu đãi tháng 11 từ phòng khám đa khoa thái hà",
        "time": "2025-11-09T14:52:41.326961",
        "image": "https://avatar/asdfasd",
        "content": "Từ ngày 9-11 đến cuối tháng 11 phòng khám có chương trình ưu đãi miễn phí khám bệnh khi đến phòng khám",
    },
    "message": "Create notification successfully"
}


GET-/api/notifications
{
    "data": {
        "content": [
            {
                "id": 5,
                "title": "Ứu đãi tháng 11 từ phòng khám đa khoa thái hà",
                "time": "2025-11-09T14:52:41",
                "image": null,
                "content": "Từ ngày 9-11 đến cuối tháng 11 phòng khám có chương trình ưu đãi miễn phí khám bệnh khi đến phòng khám",
            }
        ],
        "pageable": {
            "pageNumber": 0,
            "pageSize": 10,
            "sort": {
                "sorted": false,
                "unsorted": true,
                "empty": true
            },
            "offset": 0,
            "paged": true,
            "unpaged": false
        },
        "totalPages": 1,
        "totalElements": 1,
        "last": true,
        "first": true,
        "size": 10,
        "number": 0,
        "sort": {
            "sorted": false,
            "unsorted": true,
            "empty": true
        },
        "numberOfElements": 1,
        "empty": false
    },
    "message": "Get notifications successfully"
}

GET-/api/notifications/{id}
ressponse
{
    "data": {
        "id": 5,
        "title": "Ứu đãi tháng 11 từ phòng khám đa khoa thái hà",
        "time": "2025-11-09T14:52:41",
        "image": null,
        "content": "Từ ngày 9-11 đến cuối tháng 11 phòng khám có chương trình ưu đãi miễn phí khám bệnh khi đến phòng khám",
    },
    "message": "Get notification successfully"
}

DELETE- /api/notifications/{id}





POST-/api/files theem anh
    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("type") String type) {
        return ResponseEntity.ok(
                new ApiResponse<>(fileService.upload(file, type), "Upload file successfully")
        );
    }



ressponse{
    "data": "https://",
    "message": "Get notification successfully"
}
