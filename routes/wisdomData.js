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
router.get("/orgs", wisdomController.getRelatedOrgs);
router.get("/employee-teacher-departments", wisdomController.getTeacherEmployeeDepartments);
router.get("/classroom/details/:id", wisdomController.getClassRoomDetails);
router.get("/stages", wisdomController.fetchWisdomStages);
router.get("/teachers-dashboard/:orgId", wisdomController.fetchWisdomTeacherDashboard);
router.get("/classrooms-uploads/:classroom_id", wisdomController.fetchClassRoomUploads);

module.exports = router;