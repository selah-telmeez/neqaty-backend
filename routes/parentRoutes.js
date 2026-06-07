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
router.get('/attendance', authMiddleware, getAttendance);
router.get('/grades', authMiddleware, getGrades);
router.get('/grades/monthly', authMiddleware, getGradesMonthlyProgress);
router.get('/behaviors', authMiddleware, getBehaviors);
router.get('/evaluations', authMiddleware, getTeacherEvaluations);
router.get('/supervisor-notes', authMiddleware, getSupervisorNotes);
router.get('/news', authMiddleware, getSchoolNews);
router.get('/points', authMiddleware, getStudentPoints);
router.get('/teachers', authMiddleware, getTeachers);
router.get('/profile', authMiddleware, getStudentProfile);

module.exports = router;