const express = require("express");
const router = express.Router();
const wisdomController = require("../controllers/wisdomController");

router.get("/students", wisdomController.getStudents);
router.get("/teachers", wisdomController.getTeachers);
router.get("/classrooms", wisdomController.getClassRooms);
// the new specialization api
router.get("/specializations", wisdomController.getSpecializations);
router.get("/subjects", wisdomController.getSubjects);
router.get("/classes", wisdomController.getClasses);
router.get("/departments", wisdomController.getDepartment);
router.get("/gradebooks/:template_id", wisdomController.getGradebookScores);

module.exports = router;