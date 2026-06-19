const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const usersController = require("../controllers/usersController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/school/employees", usersController.viewSchoolEmployees);
router.get("/vtc/employees", usersController.viewVtcEmployees);
router.post("/teacher", usersController.viewTeacher);
router.post("/teacher/substitution", usersController.submitSubstitutions);
router.post("/teacher/lateness", usersController.submitTeacherLatness);
router.get("/teachers", usersController.viewTeachers);
router.get("/students", usersController.viewStudents);
router.post("/students/absence", usersController.submitStudentAbsence);
router.get("/students/absence", usersController.getStudentsAbsence);
router.get("/classes", usersController.viewClasses);
router.get("/stages", usersController.viewStages);
router.get("/schools", usersController.viewSchools);
router.post("/schools/incidents", upload.single("file"), usersController.submitIncident);
router.get("/schools/incidents/categories", usersController.viewIncidentsCategories);
router.post("/students/behavior", usersController.submitBehavior);
router.get("/students/behavior/categories", usersController.viewBehaviorCategories);
router.post("/checkinout", usersController.checkInOut);
router.get("/checkinout/view", usersController.viewCheckInOut);
router.post("/addWaitingList", usersController.addWaitingListUser);
router.get("/employee-data/:user_id", authenticateToken, usersController.viewEmployeeData);
router.get("/student-data/:user_id", authenticateToken, usersController.viewStudentData);

module.exports = router;