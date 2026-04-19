const express = require("express");
const router = express.Router();
const {
    parentLogin,
    getAttendance,
    getGrades,
    getGradesMonthlyProgress,
    getBehaviors,
    getTeacherEvaluations,
    getSupervisorNotes,
    getSchoolNews,
    getStudentProfile,
    getStudentPoints,
    getTeachers,
} = require('../controllers/parentController');
const { parentAuthMiddleware } = require('../middleware/parentAuthMiddleware');

router.post('/login', parentLogin);
router.get('/attendance', parentAuthMiddleware, getAttendance);
router.get('/grades', parentAuthMiddleware, getGrades);
router.get('/grades/monthly', parentAuthMiddleware, getGradesMonthlyProgress);
router.get('/behaviors', parentAuthMiddleware, getBehaviors);
router.get('/evaluations', parentAuthMiddleware, getTeacherEvaluations);
router.get('/supervisor-notes', parentAuthMiddleware, getSupervisorNotes);
router.get('/news', parentAuthMiddleware, getSchoolNews);
router.get('/points', parentAuthMiddleware, getStudentPoints);
router.get('/teachers', parentAuthMiddleware, getTeachers);
router.get('/profile', parentAuthMiddleware, getStudentProfile);

module.exports = router;