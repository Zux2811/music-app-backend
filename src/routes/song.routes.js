import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
import { Song } from "../models/index.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminAuth from "../middleware/admin.middleware.js";

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

// Helper: extract public_id from a Cloudinary secure_url
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    // Remove query string
    const clean = url.split("?")[0];
    // Find segment after '/upload/'
    const parts = clean.split("/upload/");
    if (parts.length < 2) return null;
    let rest = parts[1]; // e.g. v1700000000/music_app/images/abc.jpg
    // Remove leading version 'v1234567890/' if present
    rest = rest.replace(/^v\d+\//, "");
    // Remove file extension
    rest = rest.replace(/\.[a-zA-Z0-9]+$/, "");
    return rest; // e.g. music_app/images/abc
  } catch (e) {
    return null;
  }
};

const destroyIfExists = async (url, resourceType) => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (e) {
    // best-effort: try alternate type if audio is stored as raw/video
    if (resourceType === "video") {
      try { await cloudinary.uploader.destroy(publicId, { resource_type: "raw" }); } catch (_) {}
    }
  }
};

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

// Update a song (admin only)
router.put(
  "/:id",
  adminAuth,
  upload.fields([{ name: "audio" }, { name: "image" }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const song = await Song.findByPk(id);
      if (!song) return res.status(404).json({ message: "Song not found" });

      const updates = {};
      const { title, artist, album } = req.body;
      if (title !== undefined) updates.title = title;
      if (artist !== undefined) updates.artist = artist;
      if (album !== undefined) updates.album = album;

      const files = req.files || {};

      // handle audio replacement
      if (files.audio?.[0]) {
        const up = await uploadBuffer(files.audio[0].buffer, {
          resource_type: "auto",
          folder: "music_app/audio",
        });
        // delete old
        if (song.audioUrl) await destroyIfExists(song.audioUrl, "video");
        updates.audioUrl = up.secure_url;
      }

      // handle image replacement
      if (files.image?.[0]) {
        const up = await uploadBuffer(files.image[0].buffer, {
          resource_type: "auto",
          folder: "music_app/images",
        });
        if (song.imageUrl) await destroyIfExists(song.imageUrl, "image");
        updates.imageUrl = up.secure_url;
      }

      await song.update(updates);
      res.json({ message: "Song updated", song });
    } catch (err) {
      console.error("Update song error:", err);
      res.status(500).json({ message: "Update failed", error: err.message });
    }
  }
);

// Delete a song (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findByPk(id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    // best-effort delete resources
    if (song.imageUrl) await destroyIfExists(song.imageUrl, "image");
    if (song.audioUrl) await destroyIfExists(song.audioUrl, "video");

    await song.destroy();
    res.json({ message: "Song deleted" });
  } catch (err) {
    console.error("Delete song error:", err);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

router.get("/", async (req, res) => {
  const songs = await Song.findAll({ order: [["id", "DESC"]] });
  res.json(songs);
});

export default router;
