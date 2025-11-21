// src/routes/song.routes.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
import { Song } from "../models/index.js";
import authMiddleware from "../middleware/auth.middleware.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();
const upload = multer(); // memory

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

// POST /api/songs/upload
router.post(
  "/upload",
  authMiddleware,
  upload.fields([{ name: "audio" }, { name: "image" }]),
  async (req, res) => {
    try {
      const files = req.files || {};
      let audioUrl = null;
      let imageUrl = null;

      // audio -> phải dùng raw cho mp3
      if (files.audio && files.audio[0]) {
        const result = await uploadBuffer(files.audio[0].buffer, {
          resource_type: "auto", // FIX QUAN TRỌNG
          folder: "music_app/audio",
        });
        audioUrl = result.secure_url || result.url;
      }

      // image
      if (files.image && files.image[0]) {
        const result = await uploadBuffer(files.image[0].buffer, {
          resource_type: "auto",
          folder: "music_app/images",
        });
        imageUrl = result.secure_url || result.url;
      }

      const { title = "Unknown", artist = "Unknown", album = null } = req.body;

      const song = await Song.create({
        title,
        artist,
        album,
        audioUrl,
        imageUrl,
      });

      return res.status(201).json({ message: "Uploaded", song });
    } catch (err) {
      console.error("Upload error:", err);
      if (err.http_code) return res.status(err.http_code).json({ error: err.message });
      return res.status(500).json({ error: err.message || "Upload failed" });
    }
  }
);

// GET /api/songs
router.get("/", async (req, res) => {
  try {
    const songs = await Song.findAll({ order: [["id", "DESC"]] });
    res.json(songs);
  } catch (err) {
    console.error("Get songs error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
