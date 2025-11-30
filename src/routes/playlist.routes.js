import express from "express";
import {
  createPlaylist,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  getSongsInPlaylist,
  removeSongFromPlaylist, // ✅ thêm import hàm xóa bài hát
} from "../controllers/playlist.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

// 🆕 Tạo playlist mới
router.post("/", verifyToken, createPlaylist);

// 🔍 Lấy tất cả playlist của user
router.get("/user/:userId", verifyToken, getUserPlaylists);

// ✏️ Cập nhật playlist
router.put("/:id", verifyToken, updatePlaylist);

// ❌ Xóa playlist
router.delete("/:id", verifyToken, deletePlaylist);

// 🎵 Lấy danh sách bài hát trong playlist
router.get("/:id/songs", verifyToken, getSongsInPlaylist);

// ➕ Thêm bài hát vào playlist (dễ test hơn, dùng params)
router.post("/:playlistId/songs/:songId", verifyToken, addSongToPlaylist);

// ➖ Xóa bài hát khỏi playlist
router.delete("/:playlistId/songs/:songId", verifyToken, removeSongFromPlaylist);

export default router;
