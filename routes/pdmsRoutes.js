const express = require("express");
const router = express.Router();
const pdmsController = require("../controllers/pdmsController");

router.get("/forms", pdmsController.allWatomsForms);
router.get("/pedagogicalTest", pdmsController.fetchPedagogicalTest);
router.post("/mcqExam", pdmsController.submitMcqExamAnswers);
router.get("/dashboard", pdmsController.fetchWatomsPdmsDashboard);

module.exports = router;