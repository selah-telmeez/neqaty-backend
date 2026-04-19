const express = require("express");
const router = express.Router();
const wisdomController = require("../controllers/wisdomController");

router.get("/students", wisdomController.getStudents);

module.exports = router;