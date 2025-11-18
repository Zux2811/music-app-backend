import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Storage cho hình ảnh
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "music-player-images",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// Storage cho file nhạc
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "music-player-audio",
    resource_type: "video", // để upload mp3/wav/m4a
    allowed_formats: ["mp3", "wav", "m4a"],
  },
});

const uploadImage = multer({ storage: imageStorage });
const uploadAudio = multer({ storage: audioStorage });

/**
 * 🟩 Middleware upload image + audio cùng lúc
 */
export const uploadFiles = async (req, res, next) => {
  uploadImage.single("image")(req, res, function (err) {
    if (err) return res.status(400).json({ message: "Image upload error", error: err });

    uploadAudio.single("audio")(req, res, function (err2) {
      if (err2) return res.status(400).json({ message: "Audio upload error", error: err2 });

      req.uploadedFiles = {
        imageUrl: req.file?.path || null,
        audioUrl: req.files?.audio?.[0]?.path || null,
      };

      next();
    });
  });
};
