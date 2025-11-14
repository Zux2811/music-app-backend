import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  addSongToPlaylist,
  removeSongFromPlaylist,
  getSongsInPlaylist,
} from "../controllers/playlistSong.controller.js";

const router = express.Router();

// 🎵 Thêm bài hát vào playlist
router.post("/:playlistId/songs", verifyToken, addSongToPlaylist);

// ❌ Xóa bài hát khỏi playlist
router.delete("/:playlistId/songs/:songId", verifyToken, removeSongFromPlaylist);

// 📜 Lấy danh sách bài hát trong playlist
router.get("/:playlistId/songs", verifyToken, getSongsInPlaylist);

export default router;
