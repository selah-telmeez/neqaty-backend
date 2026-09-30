require("dotenv").config({ path: `${process.cwd()}/.env` });
const express = require("express");
const cors = require("cors"); //to let a front end uses the apis
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const neqatyRoutes = require("./routes/neqatyRoutes");
const dataRoutes = require("./routes/dataRoutes");
const wisdomRoutes = require("./routes/wisdomRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const bootstrapDatabase = require("./db/bootstrap");

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

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// make sure the database is ready (created / filled) before handling requests
const databaseReady = bootstrapDatabase().catch((error) => {
  console.error("Error preparing the database:", error);
});
app.use(async (req, res, next) => {
  await databaseReady;
  next();
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/data", dataRoutes);
app.use("/api/v1/wisdom", wisdomRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/neqaty", neqatyRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "invalid endpoint",
  });
});

app.use(errorHandler);

// hosts like Render provide PORT; locally APP_PORT is used
const PORT = process.env.PORT || process.env.APP_PORT || 4000;

// on Vercel the app runs as a serverless function (api/index.js), so it doesn't listen itself
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
