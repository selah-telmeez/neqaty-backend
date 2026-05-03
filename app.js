require("dotenv").config({ path: `${process.cwd()}/.env` });
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors"); //to let a front end uses the apis
const authRoutes = require("./routes/authRoutes");
const formRoutes = require("./routes/formRoutes");
const filesRoutes = require("./routes/filesRoutes");
const tasksRoutes = require("./routes/tasksRoutes");
const usersRoutes = require("./routes/usersRoutes");
const teachersRoutes = require("./routes/teachersRoutes");
const neqatyRoutes = require("./routes/neqatyRoutes");
const dataRoutes = require("./routes/dataRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const watomsRoutes = require("./routes/watomsRoutes");
const wisdomRoutes = require("./routes/wisdomRoutes");
const chatRoutes = require("./routes/chatRoutes");
const tmsRoutes = require("./routes/tmsRoutes");
const pdmsRoutes = require("./routes/pdmsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const parentRoutes = require("./routes/parentRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const { sequelize } = require("./db/models");
const { models } = sequelize;
const db = require("./db/models");

const app = express();


app.use(cors({
  origin: '*', // Allow all origins
}));

app.options('/api/v1/auth/login', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.send();
});

//app.use(
  //cors({
    //origin: process.env.FRONT_BASEURL || "http://localhost:3000",
  //})
//);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// for tms chat files
app.use("/uploads/chat", express.static(path.join(__dirname, "uploads/chat")));
// Serve news images from the news directory
app.use('/news', express.static(path.join(__dirname, 'news')));

// Routes

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/wisdom", wisdomRoutes);
app.use("/api/v1/watoms", watomsRoutes);
app.use("/api/v1/forms", formRoutes);
app.use("/api/v1/files", filesRoutes);
app.use("/api/v1/tasks", tasksRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/teachers", teachersRoutes);
app.use("/api/v1/neqaty", neqatyRoutes);
app.use("/api/v1/data", dataRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/tms", tmsRoutes);
app.use("/api/v1/pdms", pdmsRoutes);
app.use("/api/v1/parent", parentRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "invalid endpoint",
  });
});

app.use(errorHandler);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONT_BASEURL,
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    // console.log(`Joined room: ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      // CASE 1: Upload controller already saved message
      if (data.id) {
        return io.to(data.room_id).emit("receive_message", data);
      }

      // CASE 2: Save normal message
      const newMessage = await db.ChatMessage.create({
        room_id: data.room_id,
        sender_id: data.sender_id,
        message_text: data.message_text,
        file_url: data.file_url,
        file_type: data.file_type,
        file_name: data.file_name
      });

      io.to(data.room_id).emit("receive_message", newMessage);

    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    console.log("Skipping sequelize.sync(); using migrations only.");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
};
syncDatabase();

const PORT = process.env.APP_PORT || 4000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
