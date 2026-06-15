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
// const { parentAuthMiddleware } = require('../middleware/parentAuthMiddleware');
const { authMiddleware } = require("../middleware/authMiddleware");

router.post('/login', parentLogin);
router.get('/attendance/:studentId', authMiddleware, getAttendance);
router.get('/grades/:studentId', authMiddleware, getGrades);
router.get('/grades/monthly/:studentId', authMiddleware, getGradesMonthlyProgress);
router.get('/behaviors/:studentId', authMiddleware, getBehaviors);
router.get('/evaluations/:studentId', authMiddleware, getTeacherEvaluations);
router.get('/supervisor-notes/:studentId', authMiddleware, getSupervisorNotes);
router.get('/news/:studentId', authMiddleware, getSchoolNews);
router.get('/points/:studentId', authMiddleware, getStudentPoints);
router.get('/teachers/:studentId', authMiddleware, getTeachers);
router.get('/profile/:studentId', authMiddleware, getStudentProfile);

module.exports = router;