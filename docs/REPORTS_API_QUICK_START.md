# 📊 API Báo Cáo & Thống Kê - Quick Start Guide

## 🚀 Base URL
```
http://localhost:8080/api/reports
```

## 🔑 Authentication
Tất cả request cần header:
```
Authorization: Bearer {your_jwt_token}
```

---

## 📋 API Endpoints Summary

| Method | Endpoint | Mô tả | Params |
|--------|----------|-------|--------|
| GET | `/revenue` | Báo cáo doanh thu | fromDate, toDate |
| GET | `/appointments` | Báo cáo lịch khám | fromDate, toDate, doctorId?, departmentId? |
| GET | `/patients` | Báo cáo bệnh nhân | fromDate, toDate |
| GET | `/doctor-performance` | Hiệu suất bác sĩ | fromDate, toDate, doctorId? |
| GET | `/services` | Dịch vụ phổ biến | fromDate, toDate |
| GET | `/export/pdf` | Xuất PDF | reportType, fromDate, toDate |
| GET | `/export/excel` | Xuất Excel | reportType, fromDate, toDate |
| GET | `/dashboard` | Tổng hợp tất cả | fromDate, toDate |

---

## 💡 Quick Examples

### 1. Lấy báo cáo doanh thu
```javascript
const response = await axios.get('/api/reports/revenue', {
  params: {
    fromDate: '2024-01-01',
    toDate: '2024-12-31'
  },
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// Response
{
  code: 200,
  message: "Get revenue report successfully",
  data: {
    totalRevenue: 150000000,
    totalInvoices: 245,
    revenueByDays: [...],
    revenueByPaymentMethods: [...]
  }
}
```

### 2. Lấy dashboard tổng hợp
```javascript
const response = await axios.get('/api/reports/dashboard', {
  params: {
    fromDate: '2024-01-01',
    toDate: '2024-12-31'
  }
});

// Response chứa tất cả: revenue, appointments, patients, services
```

### 3. Download Excel
```javascript
const downloadReport = async (reportType) => {
  const response = await axios.get('/api/reports/export/excel', {
    params: {
      reportType: 'revenue', // hoặc: appointments, patients, doctor-performance, services
      fromDate: '2024-01-01',
      toDate: '2024-12-31'
    },
    responseType: 'blob'
  });

  // Download file
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `report.xlsx`);
  link.click();
};
```

---

## 📊 Response Structure

### Revenue Report
```json
{
  "totalRevenue": 150000000,
  "totalInvoices": 245,
  "revenueByDays": [
    { "date": "2024-01-01", "revenue": 5000000, "invoiceCount": 10 }
  ],
  "revenueByPaymentMethods": [
    { "paymentMethod": "TIEN_MAT", "amount": 80000000, "count": 150 }
  ]
}
```

### Appointments Report
```json
{
  "totalAppointments": 450,
  "completedAppointments": 380,
  "appointmentsByDoctor": [
    {
      "doctorId": 1,
      "doctorName": "BS. Nguyễn Văn A",
      "totalAppointments": 120,
      "completedAppointments": 110
    }
  ]
}
```

### Patients Report
```json
{
  "totalNewPatients": 320,
  "totalReturningPatients": 580,
  "patientsByGender": [
    { "gender": "NAM", "count": 180, "percentage": 56.25 }
  ],
  "patientsByAgeGroup": [
    { "ageGroup": "18-30", "count": 120, "percentage": 37.5 }
  ]
}
```

---

## 🎨 UI Components Suggestions

### 1. Date Range Picker
```jsx
<DateRangePicker
  startDate={fromDate}
  endDate={toDate}
  onChange={(start, end) => {
    setFromDate(start);
    setToDate(end);
    fetchReport();
  }}
/>
```

### 2. Chart cho Revenue
```jsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={data.revenueByDays}>
  <XAxis dataKey="date" />
  <YAxis />
  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
</LineChart>
```

### 3. Export Buttons
```jsx
<ButtonGroup>
  <Button onClick={() => downloadReport('excel', 'revenue')}>
    📊 Export Excel
  </Button>
  <Button onClick={() => downloadReport('pdf', 'revenue')}>
    📄 Export PDF
  </Button>
</ButtonGroup>
```

---

## 🔍 Filtering Examples

### Filter theo bác sĩ
```javascript
axios.get('/api/reports/appointments', {
  params: {
    fromDate: '2024-01-01',
    toDate: '2024-12-31',
    doctorId: 1  // Optional
  }
});
```

### Filter theo khoa
```javascript
axios.get('/api/reports/appointments', {
  params: {
    fromDate: '2024-01-01',
    toDate: '2024-12-31',
    departmentId: 2  // Optional
  }
});
```

---

## 📱 Responsive Dashboard Layout

```jsx
<Grid container spacing={3}>
  {/* Summary Cards */}
  <Grid item xs={12} md={3}>
    <Card>
      <CardContent>
        <Typography variant="h6">Tổng Doanh Thu</Typography>
        <Typography variant="h4">
          {data.revenue.totalRevenue.toLocaleString('vi-VN')} ₫
        </Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Charts */}
  <Grid item xs={12} md={8}>
    <Card>
      <CardContent>
        <Typography variant="h6">Doanh Thu Theo Ngày</Typography>
        <RevenueChart data={data.revenue.revenueByDays} />
      </CardContent>
    </Card>
  </Grid>

  {/* Tables */}
  <Grid item xs={12}>
    <Card>
      <CardContent>
        <Typography variant="h6">Lịch Khám Theo Bác Sĩ</Typography>
        <AppointmentTable data={data.appointments.appointmentsByDoctor} />
      </CardContent>
    </Card>
  </Grid>
</Grid>
```

---

## ⚠️ Error Handling

```javascript
try {
  const response = await axios.get('/api/reports/revenue', { params });
  setData(response.data.data);
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    router.push('/login');
  } else if (error.response?.status === 400) {
    // Invalid date format
    toast.error('Invalid date format');
  } else {
    // Server error
    toast.error('Failed to fetch report');
  }
}
```

---

## 🎯 Recommended Libraries

- **Charts**: `recharts`, `chart.js`, `apex-charts`
- **Date Picker**: `react-datepicker`, `antd DatePicker`
- **Tables**: `react-table`, `material-table`, `antd Table`
- **Export**: Built-in (browser download)
- **State Management**: `react-query` hoặc `swr` (recommended)

---

## 📚 Full Documentation

Xem tài liệu đầy đủ tại:
```
docs/REPORTS_API_DOCUMENTATION.md
```

---

## 🆘 Support

- Tài liệu đầy đủ: `docs/REPORTS_API_DOCUMENTATION.md`
- Báo cáo hoàn thiện: `docs/REPORT_MODULE_COMPLETION.md`
- Issues: Contact Backend Team

---

**Happy Coding! 🚀**
