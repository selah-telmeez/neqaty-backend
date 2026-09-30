const multer = require("multer");

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// kept in memory (not on disk) because serverless hosts have a read-only file system;
// the controller saves the image in the database
const uploadNeqatyLogo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only PNG, JPG, WEBP or GIF images are allowed"));
    }
    cb(null, true);
  },
}).single("logo");

module.exports = { uploadNeqatyLogo };
