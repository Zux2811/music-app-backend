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
      let audio_url = null;
      let image_url = null;

      if (files.audio && files.audio[0]) {
        const r = await uploadBuffer(files.audio[0].buffer, { resource_type: "auto", folder: "music_app/audio" });
        audio_url = r.secure_url || r.url;
      }

      if (files.image && files.image[0]) {
        const r = await uploadBuffer(files.image[0].buffer, { resource_type: "image", folder: "music_app/images" });
        image_url = r.secure_url || r.url;
      }

      const { title = "Unknown", artist = "Unknown" } = req.body;

      await db.query(
        "INSERT INTO songs (title, artist, image_url, audio_url) VALUES (?, ?, ?, ?)",
        [title, artist, image_url, audio_url]
      );

      return res.json({ message: "Uploaded", audio_url, image_url });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: err.message || err });
    }
  }
);

// get songs
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
