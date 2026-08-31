const express = require("express");
const router = express.Router();
const wisdomController = require("../controllers/wisdomController");

router.get("/employees", wisdomController.getEmployees);
router.get("/teachers", wisdomController.getTeachers);
router.get("/students", wisdomController.getStudents);
router.get("/classrooms", wisdomController.getClassRooms);
// the new specialization api
router.get("/specializations", wisdomController.getSpecializations);
router.get("/subjects", wisdomController.getSubjects);
router.get("/curriculums", wisdomController.getCurriculums);
router.get("/classes", wisdomController.getClasses);
router.get("/departments", wisdomController.getDepartment);
router.get("/gradebooks/:template_id", wisdomController.getGradebookScores);
router.get("/orgs", wisdomController.getRelatedOrgs);
router.get("/employee-teacher-departments", wisdomController.getTeacherEmployeeDepartments);
router.get("/classroom/details/:id", wisdomController.getClassRoomDetails);
router.get("/classrooms/details", wisdomController.getAllClassRoomDetails);
router.patch("/classroom-equipment/:id", wisdomController.updateClassRoomEquipment);
router.post("/classroom-equipment", wisdomController.createClassRoomEquipment);
router.get("/stages", wisdomController.fetchWisdomStages);
router.get("/teachers-dashboard/:year/:month/:orgId", wisdomController.fetchWisdomTeacherDashboard);
router.get("/curriculums-dashboard/:year/:month/:orgId", wisdomController.fetchWisdomCurriculumDashboard);
router.get("/WCP-dashboard/:year/:month/:orgId", wisdomController.fetchWisdomWCPDashboard);
router.get("/work-environment-dashboard/:year/:month/:orgId", wisdomController.fetchWisdomWorkEnvDashboard);
router.get("/educational-environment-dashboard/:year/:month/:orgId", wisdomController.fetchWisdomEduEnvDashboard);
router.get("/ODBM-dashboard/:year/:month/:orgId", wisdomController.fetchWisdomODBMDashboard);
router.get("/classrooms-uploads/:classroom_id", wisdomController.fetchClassRoomUploads);
router.get("/user-image/:user_id", wisdomController.fetchUserImage);
router.get("/teacher-classes/:teacher_id", wisdomController.fetchTeacherClasses);
router.get("/employees-absence", wisdomController.fetchEmployeesAbsence);

module.exports = router;