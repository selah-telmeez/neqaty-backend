const express = require("express");
const router = express.Router();
const wisdomController = require("../controllers/wisdomController");

router.get("/data/employees", wisdomController.getEmployees);

module.exports = router;
