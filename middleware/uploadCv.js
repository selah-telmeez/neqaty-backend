const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDir = path.join(process.cwd(), "uploads", "cvs");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 60);

    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base}-${unique}${ext}`);
  },
});

// ✅ Rely on extension (most reliable). Mimetype is often wrong.
const fileFilter = (req, file, cb) => {
  // Debug once if you want:
  // console.log("UPLOAD:", file.originalname, file.mimetype);

  const ok = /\.(pdf|doc|docx)$/i.test(file.originalname);
  if (!ok) return cb(new Error("Only PDF, DOC, DOCX files are allowed"), false);
  cb(null, true);
};

const uploadCv = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = uploadCv;