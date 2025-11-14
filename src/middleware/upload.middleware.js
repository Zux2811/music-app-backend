import multer from "multer";
import path from "path";
import fs from "fs";

// Đảm bảo thư mục upload tồn tại
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Cấu hình nơi lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "uploads/others";
    if (file.fieldname === "audio") folder = "uploads/audio";
    if (file.fieldname === "image") folder = "uploads/images";

    ensureDir(folder);
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// Chỉ chấp nhận định dạng hợp lệ
const fileFilter = (req, file, cb) => {
  const allowedAudio = [".mp3", ".wav"];
  const allowedImage = [".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    (file.fieldname === "audio" && allowedAudio.includes(ext)) ||
    (file.fieldname === "image" && allowedImage.includes(ext))
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

export const upload = multer({ storage, fileFilter });
