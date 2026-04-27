const express = require("express");
const router = express.Router();
const wisdomController = require("../controllers/wisdomController");

router.get("/students", wisdomController.getStudents);
router.get("/classrooms", wisdomController.getClassRooms);
// the new specialization api
router.get("/specializations", wisdomController.getSpecializations);
router.get("/classes", wisdomController.getClasses);

module.exports = router;