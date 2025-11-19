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
import { uploadFiles } from "../middleware/upload.middleware.js";

const router = express.Router();

// Lấy danh sách
router.get("/", getAllSongs);
router.get("/playlist/:playlistId", verifyToken, getSongsByPlaylist);
router.get("/user/:userId", verifyToken, getSongsByUser);

// Upload Cloudinary (image + audio)
router.post("/upload", verifyToken, uploadFiles, addSong);

router.put("/:id", verifyToken, updateSong);
router.delete("/:id", verifyToken, deleteSong);

export default router;
