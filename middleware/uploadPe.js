const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDir = path.join(process.cwd(), "uploads", "pe");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // safe unique name: fieldname + timestamp + random + original ext
    const ext = path.extname(file.originalname || "").toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // allow only images
  if (!file.mimetype?.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB each
});

const peCandidateUpload = upload.fields([
  { name: "candidate_picture", maxCount: 1 },
  { name: "candidate_passport", maxCount: 1 },
  { name: "candidate_ticket", maxCount: 1 },
  { name: "candidate_picture_passport", maxCount: 1 },
  { name: "candidate_picture_ticket", maxCount: 1 },
  { name: "fc_back_img", maxCount: 1 },
  { name: "fc_side_img", maxCount: 1 },
  { name: "practical_back_img", maxCount: 1 },
  { name: "practical_side_img", maxCount: 1 },
  { name: "theory_back_img", maxCount: 1 },
  { name: "theory_side_img", maxCount: 1 },
]);

module.exports = { peCandidateUpload };