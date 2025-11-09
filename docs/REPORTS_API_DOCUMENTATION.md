# API Documentation - Module Báo Cáo & Thống Kê

## Base URL
```
http://localhost:8080/api/reports
```

---

## 📊 1. Báo Cáo Doanh Thu

### **GET** `/revenue`

Lấy báo cáo doanh thu theo khoảng thời gian.

#### Query Parameters
| Tên | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|-----|------|----------|-------|-------|
| `fromDate` | `date` | ✅ | Ngày bắt đầu (ISO 8601) | `2024-01-01` |
| `toDate` | `date` | ✅ | Ngày kết thúc (ISO 8601) | `2024-12-31` |

#### Request Example
```http
GET /api/reports/revenue?fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer {your_token}
```

#### Response Example (200 OK)
```json
{
  "code": 200,
  "message": "Get revenue report successfully",
  "data": {
    "fromDate": "2024-01-01",
    "toDate": "2024-12-31",
    "totalRevenue": 150000000,
    "totalPaid": 150000000,
    "totalUnpaid": 0,
    "totalInvoices": 245,
    "totalPaidInvoices": 245,
    "totalUnpaidInvoices": 0,
    "revenueByDays": [
      {
        "date": "2024-01-01",
        "revenue": 5000000,
        "invoiceCount": 10
      },
      {
        "date": "2024-01-02",
        "revenue": 7500000,
        "invoiceCount": 15
      }
    ],
    "revenueByPaymentMethods": [
      {
        "paymentMethod": "TIEN_MAT",
        "amount": 80000000,
        "count": 150
      },
      {
        "paymentMethod": "CHUYEN_KHOAN",
        "amount": 70000000,
        "count": 95
      }
    ]
  }
}
```

---

## 📅 2. Báo Cáo Lịch Khám

### **GET** `/appointments`

Lấy báo cáo lịch khám theo bác sĩ, khoa và thời gian.

#### Query Parameters
| Tên | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|-----|------|----------|-------|-------|
| `fromDate` | `date` | ✅ | Ngày bắt đầu | `2024-01-01` |
| `toDate` | `date` | ✅ | Ngày kết thúc | `2024-12-31` |
| `doctorId` | `integer` | ❌ | Lọc theo ID bác sĩ | `1` |
| `departmentId` | `integer` | ❌ | Lọc theo ID khoa | `2` |

#### Request Example
```http
GET /api/reports/appointments?fromDate=2024-01-01&toDate=2024-12-31&doctorId=1
Authorization: Bearer {your_token}
```

#### Response Example (200 OK)
```json
{
  "code": 200,
  "message": "Get appointment report successfully",
  "data": {
    "fromDate": "2024-01-01",
    "toDate": "2024-12-31",
    "totalAppointments": 450,
    "confirmedAppointments": 420,
    "completedAppointments": 380,
    "cancelledAppointments": 40,
    "noShowAppointments": 0,
    "appointmentsByDoctor": [
      {
        "doctorId": 1,
        "doctorName": "BS. Nguyễn Văn A",
        "departmentName": "Khoa Tim Mạch",
        "totalAppointments": 120,
        "completedAppointments": 110,
        "cancelledAppointments": 10
      }
    ],
    "appointmentsByDepartment": [
      {
        "departmentId": 2,
        "departmentName": "Khoa Tim Mạch",
        "totalAppointments": 200,
        "completedAppointments": 180
      }
    ],
    "appointmentsByDay": [
      {
        "date": "2024-01-01",
        "appointmentCount": 15,
        "completedCount": 14
      }
    ]
  }
}
```

---

## 👥 3. Báo Cáo Bệnh Nhân

### **GET** `/patients`

Lấy báo cáo bệnh nhân mới và tái khám.

#### Query Parameters
| Tên | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|-----|------|----------|-------|-------|
| `fromDate` | `date` | ✅ | Ngày bắt đầu | `2024-01-01` |
| `toDate` | `date` | ✅ | Ngày kết thúc | `2024-12-31` |

#### Request Example
```http
GET /api/reports/patients?fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer {your_token}
```

#### Response Example (200 OK)
```json
{
  "code": 200,
  "message": "Get patient report successfully",
  "data": {
    "fromDate": "2024-01-01",
    "toDate": "2024-12-31",
    "totalNewPatients": 320,
    "totalReturningPatients": 580,
    "totalPatients": 900,
    "patientsByDay": [
      {
        "date": "2024-01-01",
        "newPatientCount": 8,
        "returningPatientCount": 0
      }
    ],
    "patientsByGender": [
      {
        "gender": "NAM",
        "count": 180,
        "percentage": 56.25
      },
      {
        "gender": "NU",
        "count": 140,
        "percentage": 43.75
      }
    ],
    "patientsByAgeGroup": [
      {
        "ageGroup": "Dưới 18",
        "count": 45,
        "percentage": 14.06
      },
      {
        "ageGroup": "18-30",
        "count": 120,
        "percentage": 37.5
      },
      {
        "ageGroup": "31-50",
        "count": 95,
        "percentage": 29.69
      },
      {
        "ageGroup": "51-65",
        "count": 40,
        "percentage": 12.5
      },
      {
        "ageGroup": "Trên 65",
        "count": 20,
        "percentage": 6.25
      }
    ]
  }
}
```

---

## 🏆 4. Thống Kê Hiệu Suất Bác Sĩ

### **GET** `/doctor-performance`

Lấy thống kê hiệu suất làm việc của bác sĩ.

#### Query Parameters
| Tên | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|-----|------|----------|-------|-------|
| `fromDate` | `date` | ✅ | Ngày bắt đầu | `2024-01-01` |
| `toDate` | `date` | ✅ | Ngày kết thúc | `2024-12-31` |
| `doctorId` | `integer` | ❌ | Lọc theo ID bác sĩ | `1` |

#### Request Example
```http
GET /api/reports/doctor-performance?fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer {your_token}
```

#### Response Example (200 OK)
```json
{
  "code": 200,
  "message": "Get doctor performance successfully",
  "data": {
    "fromDate": "2024-01-01",
    "toDate": "2024-12-31",
    "doctorPerformances": [
      {
        "doctorId": 1,
        "doctorName": "BS. Nguyễn Văn A",
        "departmentName": "Khoa Tim Mạch",
        "totalAppointments": 120,
        "completedAppointments": 110,
        "cancelledAppointments": 10,
        "totalPatients": 120,
        "totalRevenue": 0,
        "completionRate": 91.67,
        "averageRating": 0.0,
        "totalRatings": 0
      },
      {
        "doctorId": 2,
        "doctorName": "BS. Trần Thị B",
        "departmentName": "Khoa Nội",
        "totalAppointments": 95,
        "completedAppointments": 92,
        "cancelledAppointments": 3,
        "totalPatients": 95,
        "totalRevenue": 0,
        "completionRate": 96.84,
        "averageRating": 0.0,
        "totalRatings": 0
      }
    ]
  }
}
```

---

## 🩺 5. Thống Kê Dịch Vụ Phổ Biến

### **GET** `/services`

Lấy thống kê các dịch vụ được sử dụng nhiều nhất.

#### Query Parameters
| Tên | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|-----|------|----------|-------|-------|
| `fromDate` | `date` | ✅ | Ngày bắt đầu | `2024-01-01` |
| `toDate` | `date` | ✅ | Ngày kết thúc | `2024-12-31` |

#### Request Example
```http
GET /api/reports/services?fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer {your_token}
```

#### Response Example (200 OK)
```json
{
  "code": 200,
  "message": "Get service report successfully",
  "data": {
    "fromDate": "2024-01-01",
    "toDate": "2024-12-31",
    "totalServices": 15,
    "popularServices": [
      {
        "serviceId": 1,
        "serviceName": "Khám tim mạch tổng quát",
        "usageCount": 250,
        "totalRevenue": 62500000,
        "price": 250000
      },
      {
        "serviceId": 2,
        "serviceName": "Siêu âm tim",
        "usageCount": 180,
        "totalRevenue": 90000000,
        "price": 500000
      }
    ],
    "servicesByDepartment": [
      {
        "departmentId": 1,
        "departmentName": "Khoa Tim Mạch",
        "serviceCount": 5,
        "usageCount": 430,
        "totalRevenue": 152500000
      },
      {
        "departmentId": 2,
        "departmentName": "Khoa Nội",
        "serviceCount": 4,
        "usageCount": 320,
        "totalRevenue": 96000000
      }
    ]
  }
}
```

---

## 📄 6. Xuất Báo Cáo PDF

### **GET** `/export/pdf`

Xuất báo cáo dưới dạng file PDF.

#### Query Parameters
| Tên | Kiểu | Bắt buộc | Mô tả | Giá trị hợp lệ |
|-----|------|----------|-------|----------------|
| `reportType` | `string` | ✅ | Loại báo cáo | `revenue`, `appointments`, `patients`, `doctor-performance`, `services` |
| `fromDate` | `date` | ✅ | Ngày bắt đầu | `2024-01-01` |
| `toDate` | `date` | ✅ | Ngày kết thúc | `2024-12-31` |

#### Request Example
```http
GET /api/reports/export/pdf?reportType=revenue&fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer {your_token}
```

#### Response
- **Content-Type**: `application/pdf`
- **Headers**: `Content-Disposition: attachment; filename=report.pdf`
- **Body**: Binary PDF data

---

## 📊 7. Xuất Báo Cáo Excel

### **GET** `/export/excel`

Xuất báo cáo dưới dạng file Excel (.xlsx).

#### Query Parameters
| Tên | Kiểu | Bắt buộc | Mô tả | Giá trị hợp lệ |
|-----|------|----------|-------|----------------|
| `reportType` | `string` | ✅ | Loại báo cáo | `revenue`, `appointments`, `patients`, `doctor-performance`, `services` |
| `fromDate` | `date` | ✅ | Ngày bắt đầu | `2024-01-01` |
| `toDate` | `date` | ✅ | Ngày kết thúc | `2024-12-31` |

#### Request Example
```http
GET /api/reports/export/excel?reportType=revenue&fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer {your_token}
```

#### Response
- **Content-Type**: `application/octet-stream`
- **Headers**: `Content-Disposition: attachment; filename=report.xlsx`
- **Body**: Binary Excel data

---

## 📈 8. Dashboard Tổng Hợp

### **GET** `/dashboard`

Lấy tất cả báo cáo tổng hợp cho dashboard.

#### Query Parameters
| Tên | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|-----|------|----------|-------|-------|
| `fromDate` | `date` | ✅ | Ngày bắt đầu | `2024-01-01` |
| `toDate` | `date` | ✅ | Ngày kết thúc | `2024-12-31` |

#### Request Example
```http
GET /api/reports/dashboard?fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer {your_token}
```

#### Response Example (200 OK)
```json
{
  "code": 200,
  "message": "Get dashboard report successfully",
  "data": {
    "revenue": {
      "fromDate": "2024-01-01",
      "toDate": "2024-12-31",
      "totalRevenue": 150000000,
      "totalPaid": 150000000,
      "totalUnpaid": 0,
      "totalInvoices": 245,
      "totalPaidInvoices": 245,
      "totalUnpaidInvoices": 0,
      "revenueByDays": [...],
      "revenueByPaymentMethods": [...]
    },
    "appointments": {
      "fromDate": "2024-01-01",
      "toDate": "2024-12-31",
      "totalAppointments": 450,
      "confirmedAppointments": 420,
      "completedAppointments": 380,
      "cancelledAppointments": 40,
      "noShowAppointments": 0,
      "appointmentsByDoctor": [...],
      "appointmentsByDepartment": [...],
      "appointmentsByDay": [...]
    },
    "patients": {
      "fromDate": "2024-01-01",
      "toDate": "2024-12-31",
      "totalNewPatients": 320,
      "totalReturningPatients": 580,
      "totalPatients": 900,
      "patientsByDay": [...],
      "patientsByGender": [...],
      "patientsByAgeGroup": [...]
    },
    "services": {
      "fromDate": "2024-01-01",
      "toDate": "2024-12-31",
      "totalServices": 15,
      "popularServices": [...],
      "servicesByDepartment": [...]
    }
  }
}
```

---

## 🔐 Authentication

Tất cả các API yêu cầu Bearer Token trong header:

```http
Authorization: Bearer {your_jwt_token}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "code": 400,
  "message": "Invalid date format. Please use ISO 8601 format (YYYY-MM-DD)"
}
```

### 401 Unauthorized
```json
{
  "code": 401,
  "message": "Unauthorized. Please login first."
}
```

### 500 Internal Server Error
```json
{
  "code": 500,
  "message": "Failed to generate report"
}
```

---

## 📝 Notes

### Date Format
- Sử dụng format ISO 8601: `YYYY-MM-DD`
- Ví dụ: `2024-01-01`, `2024-12-31`

### Payment Method Values
- `TIEN_MAT`: Tiền mặt
- `CHUYEN_KHOAN`: Chuyển khoản
- `THE`: Thẻ

### Appointment Status Values
- `DA_XAC_NHAN`: Đã xác nhận
- `HOAN_THANH`: Hoàn thành
- `HUY`: Hủy
- `KHONG_DEN`: Không đến

### Gender Values
- `NAM`: Nam
- `NU`: Nữ

### Age Groups
- `Dưới 18`: Dưới 18 tuổi
- `18-30`: Từ 18 đến 30 tuổi
- `31-50`: Từ 31 đến 50 tuổi
- `51-65`: Từ 51 đến 65 tuổi
- `Trên 65`: Trên 65 tuổi

---

## 🚀 Tips for Frontend Integration

### 1. Sử dụng Date Picker
```javascript
// React example
const [dateRange, setDateRange] = useState({
  fromDate: '2024-01-01',
  toDate: '2024-12-31'
});
```

### 2. Download File (PDF/Excel)
```javascript
// Axios example
const downloadReport = async (reportType) => {
  const response = await axios.get(
    `/api/reports/export/excel?reportType=${reportType}&fromDate=2024-01-01&toDate=2024-12-31`,
    { 
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `report_${reportType}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
```

### 3. Chart Integration
```javascript
// Chart.js example - Revenue by Day
const chartData = {
  labels: data.revenueByDays.map(item => item.date),
  datasets: [{
    label: 'Doanh thu',
    data: data.revenueByDays.map(item => item.revenue),
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgba(75, 192, 192, 1)',
    borderWidth: 1
  }]
};
```

### 4. Loading States
```javascript
const [loading, setLoading] = useState(false);
const [reportData, setReportData] = useState(null);

const fetchReport = async () => {
  setLoading(true);
  try {
    const response = await api.get('/reports/revenue', { params: dateRange });
    setReportData(response.data.data);
  } catch (error) {
    console.error('Error fetching report:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ Backend Team.

**Version**: 1.0.0  
**Last Updated**: November 9, 2025
