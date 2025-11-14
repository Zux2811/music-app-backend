import express from "express";
import {
  getAllSongs,
  addSong,
  updateSong,
  deleteSong,
  getSongsByPlaylist,
  getSongsByUser,
} from "../controllers/song.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// ===============================
// 📂 1. Lấy danh sách bài hát
// ===============================
router.get("/", getAllSongs);

// Lấy bài hát theo playlist
router.get("/playlist/:playlistId", verifyToken, getSongsByPlaylist);

// Lấy bài hát theo user
router.get("/user/:userId", verifyToken, getSongsByUser);

// ===============================
// 🎵 2. Upload nhạc (file + ảnh)
// ===============================
router.post(
  "/upload",
  verifyToken,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  addSong
);

// ===============================
// ✏️ 3. Cập nhật & xóa bài hát
// ===============================
router.put("/:id", verifyToken, updateSong);
router.delete("/:id", verifyToken, deleteSong);

export default router;