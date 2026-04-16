const express = require("express");
const router = express.Router();
const peController = require("../controllers/peController");
const { peCandidateUpload } = require("../middleware/uploadPe");

router.get("/exams", peController.fetchAllExam);
router.get("/exam/:id", peController.fetchExam);
router.get("/exam/mcq/:id", peController.fetchMCQExam);
router.get("/exam/forced-choice/:id", peController.fetchForcedChoiceExam);
router.get("/exam/evaluation/:id", peController.fetchEvaluationExam);
router.get("/candidate/:id", peController.fetchCandidate);
router.post("/exam-answers", peController.submitExamAnswers);
router.post("/mcq-exam-answers", peController.submitMCQExamAnswers);
router.post("/evaluation-exam-answers", peController.submitEvaluationExamAnswers);
router.post("/forced-choice-exam-answers", peController.submitForcedChoiceExamAnswers);
router.post("/rate-scale-comment-exam-answers", peController.submitRateScaleCommentExamAnswers);
router.get("/exams/scores/:id", peController.fetchAllCandidateScores);
router.get("/exams/all/scores", peController.fetchAllCandidatesScores);
router.get("/exams/mcq/scores/:id", peController.fetchAllCandidateMCQScores);
router.get("/total-scores/:id", peController.fetchTotalScores);
router.get("/dashboard", peController.DashboardData);
router.get("/candidates", peController.getCandidatesData);
router.post("/candidate/create-user", peCandidateUpload, peController.createCandidateUser);
router.patch("/candidate/update-user/:id", peCandidateUpload, peController.updateCandidateUser);

module.exports = router;