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
const upload = multer();

const uploadBuffer = (buffer, opts = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });

router.post(
  "/upload",
  authMiddleware,
  upload.fields([{ name: "audio" }, { name: "image" }]),
  async (req, res) => {
    try {
      const files = req.files || {};
      let audioUrl = null;
      let imageUrl = null;

      if (files.audio?.[0]) {
        const result = await uploadBuffer(files.audio[0].buffer, {
          resource_type: "auto",
          folder: "music_app/audio",
        });
        audioUrl = result.secure_url;
      }

      if (files.image?.[0]) {
        const result = await uploadBuffer(files.image[0].buffer, {
          resource_type: "auto",
          folder: "music_app/images",
        });
        imageUrl = result.secure_url;
      }

      const { title, artist, album } = req.body;

      const song = await Song.create({
        title,
        artist,
        album,
        audioUrl,
        imageUrl,
      });

      res.status(201).json({ message: "Uploaded", song });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);

router.get("/", async (req, res) => {
  const songs = await Song.findAll({ order: [["id", "DESC"]] });
  res.json(songs);
});

export default router;
