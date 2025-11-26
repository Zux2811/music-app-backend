# 🔐 Admin Login Fix - Hướng Dẫn Đầy Đủ

## 📌 Tóm Tắt Vấn Đề

**Lỗi:** Khi test API `POST /api/admin/login`, nhận được:
```json
{
  "message": "Bạn không phải admin",
  "status": 403
}
```

**Nguyên nhân:** 
1. Tài khoản admin không tồn tại trong database
2. Hoặc tài khoản không có `role: "admin"`
3. Code sử dụng sai syntax (MongoDB vs Sequelize)

---

## 🚀 Giải Pháp Nhanh (3 Bước)

### 1. Tạo Admin Account
```bash
cd music-app-backend
node src/utils/createAdmin.js
```

### 2. Kiểm Tra Database
```sql
SELECT id, email, role FROM users WHERE email='admin@gmail.com';
-- Kết quả: role phải là 'admin'
```

### 3. Test API
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123456"}'
```

**Kết quả:** 200 OK + JWT token ✅

---

## 📝 Các Sửa Đổi Code

### File: `src/controllers/admin.controller.js`

**loginAdmin() function:**
```javascript
// ❌ TRƯỚC
const admin = await User.findOne({ email });
const token = jwt.sign({ id: admin._id, ... });

// ✅ SAU
const admin = await User.findOne({ where: { email } });
const token = jwt.sign({ id: admin.id, ... });
```

**getAllUsers() function:**
```javascript
// ❌ TRƯỚC
const users = await User.find({ role: "user" }).select("-password");

// ✅ SAU
const users = await User.findAll({
  where: { role: "user" },
  attributes: { exclude: ["password"] }
});
```

**deleteUser() function:**
```javascript
// ❌ TRƯỚC
await User.findByIdAndDelete(id);

// ✅ SAU
await User.destroy({ where: { id } });
```

**getAllReports() function:**
```javascript
// ❌ TRƯỚC
const reports = await Report.find().populate("user", "username email");

// ✅ SAU
const reports = await Report.findAll({
  include: [{
    model: User,
    attributes: ["username", "email"]
  }]
});
```

**resolveReport() function:**
```javascript
// ❌ TRƯỚC
await Report.findByIdAndUpdate(id, { status: "resolved" });

// ✅ SAU
await Report.update(
  { status: "resolved" },
  { where: { id } }
);
```

---

## 🔍 Lý Do Sửa Đổi

| Vấn Đề | Lý Do | Giải Pháp |
|--------|------|----------|
| `findOne({ email })` | MongoDB syntax | Dùng `{ where: { email } }` |
| `admin._id` | MongoDB field | Dùng `admin.id` (Sequelize) |
| `User.find()` | MongoDB method | Dùng `User.findAll()` |
| `.select()` | MongoDB method | Dùng `attributes` option |
| `findByIdAndDelete()` | MongoDB method | Dùng `destroy()` |
| `.populate()` | MongoDB method | Dùng `include` option |

---

## 📚 Tài Liệu Tham Khảo

- **Sequelize Docs:** https://sequelize.org/
- **JWT:** https://jwt.io/
- **bcryptjs:** https://github.com/dcodeIO/bcrypt.js

---

## ✨ Kết Quả

Sau khi làm theo các bước trên:
- ✅ Admin account được tạo thành công
- ✅ API login hoạt động bình thường
- ✅ Nhận JWT token để truy cập protected routes
- ✅ Có thể quản lý users, songs, reports qua admin dashboard

---

## [object Object] Lỗi | Giải Pháp |
|-----|----------|
| "DB connection failed" | Kiểm tra .env (DB_HOST, DB_USER, DB_PASS) |
| "Admin already exists" | Xóa admin cũ: `DELETE FROM users WHERE email='admin@gmail.com';` |
| "Password mismatch" | Dùng mật khẩu mặc định: `123456` |
| "Token expired" | Token hết hạn sau 7 ngày, đăng nhập lại |

---

**Tác giả:** Cascade AI  
**Ngày cập nhật:** 2025-11-25  
**Status:** ✅ Fixed

