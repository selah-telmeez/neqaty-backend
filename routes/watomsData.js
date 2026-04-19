const express = require("express");
const router = express.Router();
const watomsController = require("../controllers/watomsController");

router.get("/employees", watomsController.fetchWatomsAllEmployees);
router.get("/trainers", watomsController.fetchAllTrainers);
router.get("/trainers-registrations", watomsController.fetchWatomsTrainersRegistrations);
router.get("/courses", watomsController.fetchWatomsCoursesDetails);
router.get("/curriculums-orgs", watomsController.getCurriculumsOrgs);
router.get("/specializations", watomsController.getSpecializations);
router.get("/classrooms", watomsController.getClassRooms);
router.get("/system-servey", watomsController.getSystemSurvey);

module.exports = router;