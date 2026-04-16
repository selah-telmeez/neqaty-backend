const express = require("express");
const router = express.Router();
const watomsController = require("../controllers/watomsController");
const uploadNews = require("../middleware/uploadNewsMiddleware");
const peRoutes = require("./peRoutes");
const pdmsRoutes = require("./pdmsRoutes");
const watomsDataRoutes = require("./watomsData");
const uploadCv = require("../middleware/uploadCv");

// Cleaner Code
router.get("/vtcs", watomsController.fetchWatomsRelatedVtcs);
router.post("/system-survey-form", watomsController.submitWatomsSystemSurvey);

// Dashboard
router.get("/dashboard/:year/:stage/:subject/:specialization/:from/:to/:userOrganization", watomsController.fetchWatomsDashboard);
router.get("/dashboard/general-information", watomsController.fetchWatomsDashboardGeneralInformation);
// PMS
router.get("/workshop-performance-report", watomsController.fetchWorkshopPerformanceReport);
// Data
router.use("/data", watomsDataRoutes);
router.use("/pe", peRoutes);
router.use("/pdms", pdmsRoutes);
router.post("/news", uploadNews.single('image'), watomsController.publishNews);
router.get("/news", watomsController.getNewsList);
router.post("/news/:newsId/images", uploadNews.single('image'), watomsController.addNewsImage);
router.post("/news/:newsId/test-images", watomsController.addTestImagesToNews);
router.get("/news/:newsId/images", watomsController.getNewsImages);
router.put("/news/:id/notification", watomsController.updateNotification);
router.get("/managers/evaluation", watomsController.getManagerEvaluationTemplate);
router.post("/managers/evaluation", watomsController.submitManagerEvaluation);
router.get("/managers/evaluations/:id", watomsController.getManagerEvaluations);
router.get("/employees/evaluations/:id/:month", watomsController.getEmployeeEvaluation);
router.patch("/employee/evaluation", watomsController.updateManagerEvaluation);
router.post("/organization/task-score", watomsController.submitOrgTaskAvg);
router.get("/organization/task-score/:id", watomsController.getOrgTasksAvg);
router.post("/manager/comment", watomsController.submitManagerComment);
router.get("/manager/comment/:id", watomsController.getManagerComments);
router.patch("/trainee-registration/checked", watomsController.checkTrainee);
router.post("/pr/create-report", watomsController.submitEmployeePerformanceReport);
router.get("/pr/individuals-data", watomsController.getPerformanceReportIndividualsData);
router.get("/subjects", watomsController.getSubjects);
router.get("/trainers", watomsController.viewTrainers);
router.get("/all-classes", watomsController.viewAllClasses);
// needs to change filter from authority_id to system_id
router.get("/orgs-curriculums", watomsController.getOrgsCurriculums);
router.get("/related-subjects", watomsController.getWatomsSubjects);
router.post("/trainers/registration", (req, res, next) => {
    uploadCv.single("cv")(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                status: "fail",
                message: err.message,
            });
        }
        next();
    });
}, watomsController.insertTrainerRegistrationForm);

module.exports = router;