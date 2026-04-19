const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/summary', dashboardController.summary);
router.get('/centers', dashboardController.centers);
router.get('/center/:id/evaluation-breakdown', dashboardController.centerEvaluationBreakdown);
router.get('/watoms/forms/score/:userOrganization/:year', dashboardController.watomsFormsScore);
router.get('/watoms/cro/evaluation/:year', dashboardController.watomsCROScore);
router.get('/center/:id', dashboardController.centerDetails);
router.get('/center/:organizationId/annual-performance', dashboardController.getAnnualPerformanceData);
router.get('/wisdom/forms/score/:year', dashboardController.wisdomFormsScore);
router.get('/wisdom/centers', dashboardController.wisdomCenters);
router.get('/wisdom/center/:id/evaluation-breakdown', dashboardController.wisdomCenterEvaluationBreakdown);
router.get('/wisdom/center/:organizationId/annual-performance', dashboardController.getAnnualPerformanceData);
router.get('/wisdom/center/:organizationId/project-units-ranking', dashboardController.getProjectUnitsRanking);
router.get('/wisdom/cro/evaluation', dashboardController.wisdomCROScore);
router.get('/center/:organizationId/project-units-ranking', dashboardController.getProjectUnitsRanking);
router.get('/demo/forms/score', dashboardController.demoFormsScore);

router.get('/graduates', dashboardController.getGraduatesData);
router.get('/graduates/stats', dashboardController.getGraduateStats);
router.get('/applicants', dashboardController.getApplicantsData);
router.get('/applicants/stats', dashboardController.getApplicantStats);

module.exports = router;