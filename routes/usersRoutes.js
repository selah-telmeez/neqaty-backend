const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.get("/teachers", usersController.viewTeachers);
router.get("/schools", usersController.viewSchools);

module.exports = router;
