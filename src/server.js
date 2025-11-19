// import express from "express";
// import dotenv from "dotenv";
// import sequelize from "./config/db.js";

// //models
// import User from "./models/user.model.js";
// import Song from "./models/song.model.js";
// import Playlist from "./models/playlist.model.js";
// import Folder from "./models/folder.model.js";
// import PlaylistSong from "./models/playlistSong.model.js";

// //routes
// import authRoutes from "./routes/auth.routes.js";
// import userRoutes from "./routes/user.routes.js";
// import songRoutes from "./routes/song.routes.js";
// import playlistRoutes from "./routes/playlist.routes.js";
// import playlistSongRoutes from "./routes/playlistSong.routes.js";
// import folderRoutes from "./routes/folder.routes.js";
// import folderPlaylistRoutes from "./routes/folderPlaylist.routes.js";
// import userProfileRoutes from "./routes/userProfile.routes.js";
// import commentRoutes from "./routes/comment.routes.js";
// import shareRoutes from "./routes/share.routes.js";

// //middleware
// import uploadRoutes from "./middleware/upload.middleware.js";


// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));

// // ===================
// // Thiết lập quan hệ
// // ===================
// User.hasMany(Playlist, { onDelete: "CASCADE" });
// Playlist.belongsTo(User);

// User.hasMany(Folder, { onDelete: "CASCADE" });
// Folder.belongsTo(User);

// Folder.hasMany(Playlist, { onDelete: "CASCADE" });
// Playlist.belongsTo(Folder);

// Playlist.belongsToMany(Song, {
//   through: PlaylistSong,
//   foreignKey: "playlistId",
//   otherKey: "songId",
// });
// Song.belongsToMany(Playlist, {
//   through: PlaylistSong,
//   foreignKey: "songId",
//   otherKey: "playlistId",
// });

// // ===================
// // Routes
// // ===================
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/songs", songRoutes);
// app.use("/api/playlists", playlistRoutes);
// app.use("/api/playlists", playlistSongRoutes);
// app.use("/api/folders", folderRoutes);
// app.use("/api/folder-playlists", folderPlaylistRoutes);
// app.use("/api/profile", userProfileRoutes);
// app.use("/api/comments", commentRoutes);
// app.use("/api/share", shareRoutes);
// app.use("/api", uploadRoutes);


// // ===================
// // DB Sync + Server
// // ===================
// sequelize
//   .sync({ alter: true })
//   .then(() => console.log("Database synced successfully!"))
//   .catch((err) => console.error("Error syncing database:", err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";

// ========== Models ==========
import User from "./models/user.model.js";
import Song from "./models/song.model.js";
import Playlist from "./models/playlist.model.js";
import Folder from "./models/folder.model.js";
import PlaylistSong from "./models/playlistSong.model.js";
import Comment from "./models/comment.model.js";

// ========== Routes ==========
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import songRoutes from "./routes/song.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import playlistSongRoutes from "./routes/playlistSong.routes.js";
import folderRoutes from "./routes/folder.routes.js";
import folderPlaylistRoutes from "./routes/folderPlaylist.routes.js";
import userProfileRoutes from "./routes/userProfile.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import shareRoutes from "./routes/share.routes.js";

// Upload to Cloudinary
import uploadRoutes from "./routes/upload.routes.js"; 
// ⚠️ lưu ý: bạn PHẢI đổi từ middleware → routes đúng

dotenv.config();

const app = express();
app.use(express.json());

// Static folder (nếu dùng local upload)
app.use("/uploads", express.static("uploads"));

// ===================
// Thiết lập quan hệ
// ===================
User.hasMany(Playlist, { onDelete: "CASCADE" });
Playlist.belongsTo(User);

User.hasMany(Folder, { onDelete: "CASCADE" });
Folder.belongsTo(User);

User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(UserProfile, { foreignKey: "user_id" });
UserProfile.belongsTo(User, { foreignKey: "user_id" });

Folder.hasMany(Playlist, { onDelete: "CASCADE" });
Playlist.belongsTo(Folder);

Playlist.belongsToMany(Song, {
  through: PlaylistSong,
  foreignKey: "playlistId",
  otherKey: "songId",
});
Song.belongsToMany(Playlist, {
  through: PlaylistSong,
  foreignKey: "songId",
  otherKey: "playlistId",
});

// ===================
// Routes
// ===================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/playlists", playlistSongRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/folder-playlists", folderPlaylistRoutes);
app.use("/api/profile", userProfileRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/share", shareRoutes);

// Cloudinary upload route
app.use("/api/upload", uploadRoutes);

// ===================
// DB Sync + Server
// ===================
sequelize
  .sync({ force: true })
  // .sync()
  .then(() => console.log("Database synced successfully!"))
  .catch((err) => console.error("Error syncing database:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
