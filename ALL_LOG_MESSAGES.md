# All Log Messages Reference

## Server Logs

```
[SERVER] Starting application...
[SERVER] Environment: { NODE_ENV, PORT, SKIP_DB, SEQUELIZE_ALTER }
[SERVER] Middleware configured
[SERVER] Health check endpoint called
[SERVER] ✓ Server listening on port PORT
[SERVER] ✓ Application started successfully
[SERVER] Available routes:
```

---

## Database Logs

```
[DB] Starting database initialization...
[DB] SKIP_DB=true -> Bỏ qua kết nối/đồng bộ DB
[DB] Authenticating with database...
[DB] ✓ Sequelize connected successfully
[DB] Syncing database models...
[DB] ✓ DB synced (alter:true)
[DB] Checking for legacy url->audioUrl migration...
[DB] ✓ Migrated legacy url -> audioUrl where needed
[DB] Legacy url->audioUrl migration skipped: MESSAGE
[DB] Dropping legacy 'url' column...
[DB] ✓ Dropped legacy 'url' column from songs
[DB] Drop legacy 'url' column skipped: MESSAGE
[DB] Recomputing comment likes from join table...
[DB] ✓ Recomputed comments.likes from comment_likes join table
[DB] Recompute comments.likes skipped: MESSAGE
[DB] Dropping legacy 'liked_by' column...
[DB] ✓ Dropped legacy 'liked_by' column from comments
[DB] Drop legacy 'liked_by' column skipped: MESSAGE
[DB] ✓ Database initialization completed successfully
[DB] ✗ DB connection/sync error: MESSAGE
```

---

## Register Logs

```
[REGISTER] Received request: { username, email }
[REGISTER] Missing required fields
[REGISTER] Checking if email already exists: EMAIL
[REGISTER] Email already exists: EMAIL
[REGISTER] Hashing password for: EMAIL
[REGISTER] Creating new user: { username, email }
[REGISTER] User created successfully: { id, email }
[REGISTER] Error: MESSAGE
```

---

## Login Logs

```
[LOGIN] Received login request for email: EMAIL
[LOGIN] Missing email or password
[LOGIN] Finding user with email: EMAIL
[LOGIN] User not found: EMAIL
[LOGIN] Comparing password for user: EMAIL
[LOGIN] Invalid password for user: EMAIL
[LOGIN] Creating JWT token for user: { id, email, role }
[LOGIN] Login successful for user: EMAIL
[LOGIN] Error: MESSAGE
```

---

## Google SignIn Logs

```
[GOOGLE_SIGNIN] Received Google sign-in request
[GOOGLE_SIGNIN] Missing idToken
[GOOGLE_SIGNIN] GOOGLE_CLIENT_ID not configured
[GOOGLE_SIGNIN] Verifying Google ID token
[GOOGLE_SIGNIN] Cannot extract email from Google token
[GOOGLE_SIGNIN] Google token verified for email: EMAIL
[GOOGLE_SIGNIN] Looking for existing user: EMAIL
[GOOGLE_SIGNIN] Creating new user from Google: { name, email }
[GOOGLE_SIGNIN] New user created: { id, email }
[GOOGLE_SIGNIN] Existing user found: { id, email }
[GOOGLE_SIGNIN] Creating JWT token for user: { id, email, role }
[GOOGLE_SIGNIN] Google sign-in successful for: EMAIL
[GOOGLE_SIGNIN] Error: MESSAGE
```

---

## Song Logs

```
[GET_ALL_SONGS] Fetching all songs
[GET_ALL_SONGS] Found X songs
[GET_ALL_SONGS] Error: MESSAGE

[ADD_SONG] Received song upload request
[ADD_SONG] Song details: { title, artist, album }
[ADD_SONG] Audio file is required but not provided
[ADD_SONG] Files received: { hasAudio, hasImage, audioSize, imageSize }
[ADD_SONG] Uploading image to Cloudinary...
[ADD_SONG] Image uploaded successfully: URL
[ADD_SONG] Image upload failed: MESSAGE
[ADD_SONG] Uploading audio to Cloudinary...
[ADD_SONG] Audio uploaded successfully: URL
[ADD_SONG] Audio upload failed: MESSAGE
[ADD_SONG] Saving song to database...
[ADD_SONG] Song saved successfully: { id, title }
[ADD_SONG] Error: MESSAGE

[UPDATE_SONG] Received update request for song ID: ID
[UPDATE_SONG] Update data: { title, artist, album }
[UPDATE_SONG] Song not found: ID
[UPDATE_SONG] Updating song: ID
[UPDATE_SONG] Song updated successfully: ID
[UPDATE_SONG] Error: MESSAGE

[DELETE_SONG] Received delete request for song ID: ID
[DELETE_SONG] Song not found: ID
[DELETE_SONG] Deleting song: { id, title }
[DELETE_SONG] Song deleted successfully: ID
[DELETE_SONG] Error: MESSAGE

[GET_SONGS_BY_PLAYLIST] Fetching songs for playlist ID: ID
[GET_SONGS_BY_PLAYLIST] Playlist not found: ID
[GET_SONGS_BY_PLAYLIST] Found X songs for playlist: ID
[GET_SONGS_BY_PLAYLIST] Error: MESSAGE

[GET_SONGS_BY_USER] Fetching songs for user ID: ID
[GET_SONGS_BY_USER] User not found: ID
[GET_SONGS_BY_USER] Found X songs for user: ID
[GET_SONGS_BY_USER] Error: MESSAGE
```

---

## Auth Middleware Logs

```
[AUTH_MIDDLEWARE] Checking authorization for: METHOD PATH
[AUTH_MIDDLEWARE] No token provided
[AUTH_MIDDLEWARE] Verifying JWT token
[AUTH_MIDDLEWARE] Token verified for user: { id, email, role }
[AUTH_MIDDLEWARE] Token verification failed: MESSAGE
```

---

## Log Levels

- ✓ = Success
- ✗ = Error
- No symbol = Info/Warning

---

**Reference**: 2025-11-30

