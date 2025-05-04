// middlewares/uploadAvatar.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 创建目录（如果不存在）
const uploadPath = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.params.id}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB 限制
  fileFilter: (req, file, cb) => {
    const validTypes = ["image/jpeg", "image/png"];
    cb(null, validTypes.includes(file.mimetype));
  }
});

module.exports = upload;