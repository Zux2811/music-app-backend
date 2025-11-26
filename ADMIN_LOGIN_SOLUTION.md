# 🔐 Giải Pháp Lỗi Admin Login - "Bạn không phải admin"

## 🎯 Vấn Đề

Khi test API:
```bash
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "123456"
}
```

Nhận được lỗi:
```json
{
  "message": "Bạn không phải admin"
}
```

---

## 🔴 Nguyên Nhân Gốc Rễ

### **1. Tài khoản admin chưa tồn tại hoặc không có role "admin"**
- Nếu bạn đăng ký `admin@gmail.com` qua `/api/auth/register`, nó sẽ có `role: "user"` (mặc định)
- Cần tạo tài khoản với `role: "admin"` trong database

### **2. Code sử dụng sai syntax (MongoDB vs Sequelize)**
- ❌ `User.findOne({ email })` → ✅ `User.findOne({ where: { email } })`
- ❌ `admin._id` → ✅ `admin.id`
- ❌ `User.find()` → ✅ `User.findAll()`

---

## ✅ Cách Khắc Phục

### **Bước 1: Tạo Tài Khoản Admin**

Chạy script:
```bash
cd music-app-backend
node src/utils/createAdmin.js
```

**Kết quả:**
```
DB connected!
✅ Admin created successfully!
```

### **Bước 2: Kiểm Tra Database**

```sql
SELECT id, username, email, role FROM users 
WHERE email = 'admin@gmail.com';
```

Phải hiển thị:
```
| id | username | email           | role  |
| 1  | admin    | admin@gmail.com | admin |
```

### **Bước 3: Test API Lại**

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gmail.com", "password": "123456"}'
```

**Response thành công:**
```json
{
  "message": "Đăng nhập admin thành công",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@gmail.com",
    "role": "admin"
  }
}
```

---

## 📝 Các Sửa Đổi Trong Code

**File:** `src/controllers/admin.controller.js`

| Hàm | Sửa Đổi |
|-----|---------|
| `loginAdmin()` | Dùng `{ where: { email } }` + `admin.id` |
| `getAllUsers()` | Dùng `findAll()` + `attributes` |
| `deleteUser()` | Dùng `destroy()` |
| `getAllReports()` | Dùng `findAll()` + `include` |
| `resolveReport()` | Dùng `update()` |

---

## 🚀 Tiếp Theo

1. ✅ Tạo admin account
2. ✅ Đăng nhập admin thành công
3. ⏳ Test các API admin khác (users, reports, etc.)
4. ⏳ Sử dụng token để truy cập protected routes

