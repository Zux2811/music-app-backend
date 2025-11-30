# Backend Log Improvements Summary

## [object Object]ỗi Đã Sửa

### 1. **Lỗi Cú Pháp trong `server.js` (Dòng 127)**
- **Vấn đề**: Có một dấu `}` thừa trong block if/else của phần database initialization
- **Nguyên nhân**: Lỗi cấu trúc code khi xử lý DROP_LEGACY_URL
- **Giải pháp**: Xóa dấu `}` thừa và sửa lại cấu trúc code đúng

---

## 📝 Log Đã Thêm

### 1. **Authentication Controller** (`auth.controller.js`)

#### Register Function
```
[REGISTER] Received request: { username, email }
[REGISTER] Missing required fields (nếu có)
[REGISTER] Checking if email already exists
[REGISTER] Email already exists (nếu có)
[REGISTER] Hashing password
[REGISTER] Creating new user
[REGISTER] User created successfully: { id, email }
[REGISTER] Error: (nếu có lỗi)
```

#### Login Function
```
[LOGIN] Received login request for email
[LOGIN] Missing email or password (nếu có)
[LOGIN] Finding user with email
[LOGIN] User not found (nếu có)
[LOGIN] Comparing password
[LOGIN] Invalid password (nếu có)
[LOGIN] Creating JWT token
[LOGIN] Login successful
[LOGIN] Error: (nếu có lỗi)
```

#### Google Sign-In Function
```
[GOOGLE_SIGNIN] Received Google sign-in request
[GOOGLE_SIGNIN] Missing idToken (nếu có)
[GOOGLE_SIGNIN] GOOGLE_CLIENT_ID not configured (nếu có)
[GOOGLE_SIGNIN] Verifying Google ID token
[GOOGLE_SIGNIN] Cannot extract email from Google token (nếu có)
[GOOGLE_SIGNIN] Google token verified for email
[GOOGLE_SIGNIN] Looking for existing user
[GOOGLE_SIGNIN] Creating new user from Google
[GOOGLE_SIGNIN] New user created: { id, email }
[GOOGLE_SIGNIN] Existing user found: { id, email }
[GOOGLE_SIGNIN] Creating JWT token
[GOOGLE_SIGNIN] Google sign-in successful
[GOOGLE_SIGNIN] Error: (nếu có lỗi)
```

### 2. **Song Controller** (`song.controller.js`)

#### Get All Songs
```
[GET_ALL_SONGS] Fetching all songs
[GET_ALL_SONGS] Found X songs
[GET_ALL_SONGS] Error: (nếu có lỗi)
```

#### Add Song (Upload)
```
[ADD_SONG] Received song upload request
[ADD_SONG] Song details: { title, artist, album }
[ADD_SONG] Audio file is required but not provided (nếu có)
[ADD_SONG] Files received: { hasAudio, hasImage, audioSize, imageSize }
[ADD_SONG] Uploading image to Cloudinary...
[ADD_SONG] Image uploaded successfully: URL
[ADD_SONG] Image upload failed: ERROR (nếu có)
[ADD_SONG] Uploading audio to Cloudinary...
[ADD_SONG] Audio uploaded successfully: URL
[ADD_SONG] Audio upload failed: ERROR (nếu có)
[ADD_SONG] Saving song to database...
[ADD_SONG] Song saved successfully: { id, title }
[ADD_SONG] Error: (nếu có lỗi)
```

#### Update Song
```
[UPDATE_SONG] Received update request for song ID
[UPDATE_SONG] Update data: { title, artist, album }
[UPDATE_SONG] Song not found (nếu có)
[UPDATE_SONG] Updating song
[UPDATE_SONG] Song updated successfully
[UPDATE_SONG] Error: (nếu có lỗi)
```

#### Delete Song
```
[DELETE_SONG] Received delete request for song ID
[DELETE_SONG] Song not found (nếu có)
[DELETE_SONG] Deleting song: { id, title }
[DELETE_SONG] Song deleted successfully
[DELETE_SONG] Error: (nếu có lỗi)
```

#### Get Songs By Playlist
```
[GET_SONGS_BY_PLAYLIST] Fetching songs for playlist ID
[GET_SONGS_BY_PLAYLIST] Playlist not found (nếu có)
[GET_SONGS_BY_PLAYLIST] Found X songs for playlist
[GET_SONGS_BY_PLAYLIST] Error: (nếu có lỗi)
```

#### Get Songs By User
```
[GET_SONGS_BY_USER] Fetching songs for user ID
[GET_SONGS_BY_USER] User not found (nếu có)
[GET_SONGS_BY_USER] Found X songs for user
[GET_SONGS_BY_USER] Error: (nếu có lỗi)
```

### 3. **Authentication Middleware** (`auth.middleware.js`)

```
[AUTH_MIDDLEWARE] Checking authorization for: METHOD PATH
[AUTH_MIDDLEWARE] No token provided (nếu có)
[AUTH_MIDDLEWARE] Verifying JWT token
[AUTH_MIDDLEWARE] Token verified for user: { id, email, role }
[AUTH_MIDDLEWARE] Token verification failed: ERROR
```

### 4. **Server Initialization** (`server.js`)

#### Startup Logs
```
[SERVER] Starting application...
[SERVER] Environment: { NODE_ENV, PORT, SKIP_DB, SEQUELIZE_ALTER }
[SERVER] Middleware configured
[SERVER] Health check endpoint called
```

#### Database Initialization
```
[DB] Starting database initialization...
[DB] SKIP_DB=true -> Bỏ qua kết nối/đồng bộ DB (nếu có)
[DB] Authenticating with database...
[DB] ✓ Sequelize connected successfully
[DB] Syncing database models...
[DB] ✓ DB synced (alter:true)
[DB] Checking for legacy url->audioUrl migration...
[DB] ✓ Migrated legacy url -> audioUrl where needed
[DB] Dropping legacy 'url' column...
[DB] ✓ Dropped legacy 'url' column from songs
[DB] Recomputing comment likes from join table...
[DB] ✓ Recomputed comments.likes from comment_likes join table
[DB] Dropping legacy 'liked_by' column...
[DB] ✓ Dropped legacy 'liked_by' column from comments
[DB] ✓ Database initialization completed successfully
[DB] ✗ DB connection/sync error: ERROR MESSAGE
```

#### Server Ready
```
[SERVER] ✓ Server listening on port 5000
[SERVER] ✓ Application started successfully
[SERVER] Available routes:
  - GET  /                 (health check)
  - GET  /health           (health check)
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/google-signin
  - GET  /api/songs
  - POST /api/songs
  - And more...
```

---

## 🎯 Lợi Ích Của Log Mới

1. **Dễ Dàng Debug**: Mỗi action được log với prefix rõ ràng `[MODULE_NAME]`
2. **Theo Dõi Luồng**: Có thể theo dõi toàn bộ luồng request từ đầu đến cuối
3. **Phát Hiện Lỗi Nhanh**: Error logs có stack trace đầy đủ
4. **Kiểm Tra Dữ Liệu**: Log các dữ liệu quan trọng (id, email, file size, etc.)
5. **Hiệu Suất**: Có thể xác định bottleneck bằng cách xem thời gian giữa các log
6. **Bảo Mật**: Không log password, chỉ log email và id

---

## [object Object]ách Sử Dụng

### Chạy Backend
```bash
cd music-app-backend
npm start
```

### Xem Logs
- Tất cả logs sẽ được in ra console
- Có thể redirect logs vào file:
```bash
npm start > logs.txt 2>&1
```

### Kiểm Tra Lỗi
1. Tìm `[ERROR]` hoặc `[✗]` trong logs
2. Xem stack trace để biết vị trí lỗi
3. Kiểm tra các log trước đó để hiểu ngữ cảnh

---

## 📊 Ví Dụ Log Output

```
[SERVER] Starting application...
[SERVER] Environment: { NODE_ENV: 'development', PORT: 5000, SKIP_DB: false, SEQUELIZE_ALTER: true }
[SERVER] Middleware configured
[DB] Starting database initialization...
[DB] Authenticating with database...
[DB] ✓ Sequelize connected successfully
[DB] Syncing database models...
[DB] ✓ DB synced (alter:true)
[DB] ✓ Database initialization completed successfully
[SERVER] ✓ Server listening on port 5000
[SERVER] ✓ Application started successfully
[LOGIN] Received login request for email: user@example.com
[LOGIN] Finding user with email: user@example.com
[LOGIN] Comparing password for user: user@example.com
[LOGIN] Creating JWT token for user: { id: 1, email: 'user@example.com', role: 'user' }
[LOGIN] Login successful for user: user@example.com
```

---

## ✅ Các File Đã Cập Nhật

1. ✅ `src/server.js` - Sửa lỗi cú pháp + thêm log
2. ✅ `src/controllers/auth.controller.js` - Thêm log chi tiết
3. ✅ `src/controllers/song.controller.js` - Thêm log chi tiết
4. ✅ `src/middleware/auth.middleware.js` - Thêm log chi tiết

---

**Ngày cập nhật**: 2025-11-30
**Phiên bản**: 1.0

