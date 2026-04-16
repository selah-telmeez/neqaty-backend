const db = require('../db/models');
require("dotenv").config();

exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate room
    const room = await db.ChatRoom.findByPk(roomId);
    if (!room) {
      return res.status(404).json({
        status: "fail",
        message: "Room not found",
      });
    }

    // Fetch messages for this room
    const messages = await db.ChatMessage.findAll({
      where: { room_id: roomId },
      order: [["createdAt", "ASC"]],
    });

    return res.json({
      status: "success",
      count: messages.length,
      messages,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Server error occurred",
    });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { sender_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const fileUrl = `${process.env.BACKEND_URL}/uploads/chat/${req.file.filename}`;

    const message = await db.ChatMessage.create({
      room_id: roomId,
      sender_id,
      file_url: fileUrl,
      file_type: req.file.mimetype,
      file_name: req.file.originalname,
    });

    // ❌ REMOVE BROADCAST HERE
    // req.app.get("io").to(roomId).emit("receive_message", message);

    // Instead, return message → frontend will broadcast
    return res.status(201).json({
      status: "success",
      message,
    });

  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({
      status: "error",
      message: "File upload failed",
    });
  }
};