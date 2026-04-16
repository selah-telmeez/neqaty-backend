const express = require("express");
const router = express.Router();
const pdmsController = require("../controllers/pdmsController");
const wisdomController = require("../controllers/wisdomController");
const wisdomDataRoutes = require("./wisdomData");

// cleaned apis
router.get("/dashboard/:year/:stage/:subject/:specialization/:from/:to", wisdomController.fetchWisdomDashboard);
router.get("/dashboard/general-information", wisdomController.fetchWisdomDashboardGeneralInformation);
router.get("/schools", wisdomController.fetchWisdomRelatedSchools);
router.get("/forms", wisdomController.fetchWisdomForms);
router.post("/create-new-grade-book", wisdomController.createNewGradeBook);
router.use("/data", wisdomDataRoutes);
// old apis
router.get("/pdms/forms", pdmsController.allWisdomForms);
router.get("/pdms/pedagogicalTest", pdmsController.fetchPedagogicalTest);
router.post("/pdms/mcqExam", pdmsController.submitMcqExamAnswers);
router.get("/pdms/dashboard", pdmsController.fetchWisdomPdmsDashboard);
router.get("/stages", wisdomController.fetchWisdomStages);
router.get("/subjects", wisdomController.fetchWisdomSubjects);
router.get("/specializations", wisdomController.fetchWisdomSpecializations);

module.exports = router;