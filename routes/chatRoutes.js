const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const upload = require("../middleware/chatUpload");

router.get("/tms/:roomId/messages", chatController.getRoomMessages);
router.post("/tms/:roomId/upload", upload.single("file"), chatController.uploadFile);

module.exports = router;