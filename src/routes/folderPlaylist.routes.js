import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  addPlaylistToFolder,
  getPlaylistsInFolder,
  removePlaylistFromFolder,
} from "../controllers/folderPlaylist.controller.js";

const router = express.Router();

// 🟢 Thêm playlist vào folder
router.post("/:folderId/playlists/:playlistId", verifyToken, addPlaylistToFolder);

// 🟡 Lấy danh sách playlist trong folder
router.get("/:folderId/playlists", verifyToken, getPlaylistsInFolder);

// 🔴 Gỡ playlist khỏi folder
router.delete("/playlists/:playlistId", verifyToken, removePlaylistFromFolder);

export default router;
