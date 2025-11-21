// src/routes/song.routes.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
import db from "../config/db.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();
const upload = multer(); // memory storage

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

// upload audio + image
router.post(
  "/upload",
  upload.fields([{ name: "audio" }, { name: "image" }]),
  async (req, res) => {
    try {
      const files = req.files || {};
      let audioUrl = null;
      let imageUrl = null;

      if (files.audio && files.audio[0]) {
        const r = await uploadBuffer(files.audio[0].buffer, {
          resource_type: "video",
          folder: "music_app/audio"
        });
        audioUrl = r.secure_url || r.url;
      }

      if (files.image && files.image[0]) {
        const r = await uploadBuffer(files.image[0].buffer, {
          resource_type: "image",
          folder: "music_app/images"
        });
        imageUrl = r.secure_url || r.url;
      }

      const { title = "Unknown", artist = "Unknown", album = null } = req.body;

      await db.query(
        `INSERT INTO songs (title, artist, album, imageUrl, audioUrl, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [title, artist, album, imageUrl, audioUrl]
      );

      return res.json({ message: "Uploaded", audioUrl, imageUrl });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: err.message || err });
    }
  }
);

// get all songs
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM songs ORDER BY id DESC");
    return res.json(rows);
  } catch (err) {
    console.error("Get songs error:", err);
    return res.status(500).json({ error: err.message || err });
  }
});

export default router;
