const multer = require("multer");
const path = require("path");
const fs = require("fs");

const LOGO_DIR = path.join(__dirname, "..", "uploads", "neqaty");
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(LOGO_DIR, { recursive: true });
    cb(null, LOGO_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    cb(null, `logo-${Date.now()}${ext}`);
  },
});

const uploadNeqatyLogo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only PNG, JPG, WEBP or GIF images are allowed"));
    }
    cb(null, true);
  },
}).single("logo");

module.exports = { uploadNeqatyLogo, LOGO_DIR };
