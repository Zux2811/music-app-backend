# Backend Debugging Guide - Hướng Dẫn Debug Backend

## ✅ Lỗi Đã Sửa

### 1. Lỗi Cú Pháp trong `server.js`
- **Vị trí**: Dòng 127  
- **Lỗi**: Dấu `}` thừa trong block if/else  
- **Trạng thái**: ✅ ĐÃ SỬA

---

## 📊 Log System - Hệ Thống Log

### Cấu Trúc Log
Tất cả logs theo format: `[MODULE_NAME] Message`

**Ví dụ**:
```
[SERVER] Starting application...
[DB] Authenticating with database...
[LOGIN] Received login request for email: user@example.com
```

### Các Module Có Log

| Module | Prefix | Chức Năng |
|--------|--------|----------|
| Server | `[SERVER]` | Khởi động, routes |
| Database | `[DB]` | Kết nối, sync |
| Auth | `[LOGIN]`, `[REGISTER]` | Xác thực |
| Middleware | `[AUTH_MIDDLEWARE]` | Kiểm tra token |
| Songs | `[GET_ALL_SONGS]`, `[ADD_SONG]` | Quản lý bài hát |

---

## 🚀 Chạy Backend

### Bước 1: Cài đặt
```bash
cd music-app-backend
npm install
```

### Bước 2: Cấu Hình .env
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=music_app
JWT_SECRET=your_secret_key
```

### Bước 3: Chạy
```bash
npm start
```

---

## 🐛 Debugging Tips

### Kiểm Tra Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'
```

### Kiểm Tra Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

---

## 🔴 Xử Lý Lỗi

### Lỗi: "No token"
**Giải pháp**: Thêm header `Authorization: Bearer TOKEN`

### Lỗi: "Invalid token"
**Giải pháp**: Token hết hạn, cần login lại

### Lỗi: Database Connection
**Giải pháp**: Kiểm tra MySQL đang chạy

---

## 💾 Lưu Logs

### Lưu vào file
```bash
npm start > backend.log 2>&1
```

### Tìm lỗi
```bash
grep "\[ERROR\]\|\[✗\]" backend.log
```

---

**Cập nhật**: 2025-11-30

