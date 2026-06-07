const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { comparePassword, hashPassword } = require('../utils/hashPassword');
const db = require('../db/models');
require('dotenv').config();

const {
    Parent,
    Student,
    Organization,
    Class,
    Specialization,
    studentAttendance,
    studentBehavior,
    studentBehaviorType,
    QuizTest,
    QuizzesTestsTemplate,
    Subject,
    Teacher,
    Employee,
    TeacherEvaluation,
    ManagerComment,
    Session,
    PublishedNews,
    UsersPoints,
    PointsHistory,
    RewardsAndPunishments,
} = db;

// POST /api/v1/parents/login
const parentLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const parent = await Parent.findOne({
            where: { username, deleted: false },
            include: [
                {
                    model: Student,
                    as: 'student',
                    include: [
                        { model: Class, as: 'class', attributes: ['id', 'name'] },
                        { model: Specialization, as: 'specialization', attributes: ['id', 'name'] },
                        {
                            model: Organization,
                            as: 'school',
                            attributes: ['id', 'name', 'city', 'location'],
                        },
                    ],
                },
            ],
        });

        if (!parent) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isMatch = await comparePassword(password, parent.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: parent.id, student_id: parent.student_id },
            process.env.JWT_SECRET_PARENT,
            { expiresIn: '8h' }
        );

        const s = parent.student;
        res.status(200).json({
            message: 'Login successful',
            token,
            student: {
                id: s.id,
                name: `${s.first_name} ${s.middle_name} ${s.last_name}`.trim(),
                class: s.class,
                specialization: s.specialization,
            },
            school: s.school,
        });
    } catch (error) {
        console.error('Parent Login Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/v1/parents/attendance
const getAttendance = async (req, res) => {
    try {
        const student_id = req.user.student.id;

        const attendance = await studentAttendance.findAll({
            where: { student_id, deleted: false },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'status', 'reason', 'createdAt'],
        });

        res.status(200).json({ attendance });
    } catch (error) {
        console.error('getAttendance Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/v1/parents/grades
const getGrades = async (req, res) => {
    try {
        const student_id = req.user.student.id;
        const grades = await QuizTest.findAll({
            where: { student_id, deleted: false },
            include: [
                {
                    model: QuizzesTestsTemplate,
                    as: 'template',
                    attributes: ['id', 'name', 'type', 'start_date', 'end_date'],
                    include: [
                        { model: Subject, as: 'subject', attributes: ['id', 'name'] },
                    ],
                },
                {
                    model: Teacher,
                    as: 'teacher',
                    include: [
                        {
                            model: Employee,
                            as: 'employee',
                            attributes: ['first_name', 'middle_name', 'last_name'],
                        },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({ grades });
    } catch (error) {
        console.error('getGrades Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/v1/parents/grades/monthly
const getGradesMonthlyProgress = async (req, res) => {
    try {
        const student_id = req.user.student.id;
        const { sequelize } = db;

        const monthlyData = await QuizTest.findAll({
            where: { student_id, deleted: false },
            attributes: [
                [sequelize.fn('TO_CHAR', sequelize.col('QuizTest.createdAt'), 'YYYY-MM'), 'month'],
                [sequelize.fn('AVG', sequelize.col('result')), 'avg_score'],
                [sequelize.fn('MAX', sequelize.col('result')), 'max_score'],
                [sequelize.fn('MIN', sequelize.col('result')), 'min_score'],
                [sequelize.fn('COUNT', sequelize.col('QuizTest.id')), 'count'],
            ],
            group: [sequelize.fn('TO_CHAR', sequelize.col('QuizTest.createdAt'), 'YYYY-MM')],
            order: [[sequelize.fn('TO_CHAR', sequelize.col('QuizTest.createdAt'), 'YYYY-MM'), 'ASC']],
            raw: true,
        });

        res.status(200).json({ monthlyProgress: monthlyData });
    } catch (error) {
        console.error('getGradesMonthlyProgress Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/v1/parents/behaviors
const getBehaviors = async (req, res) => {
    try {
        const student_id = req.user.student.id;

        // Get student's user_id first
        const student = await Student.findOne({ where: { id: student_id }, attributes: ['user_id'] });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const behaviors = await studentBehavior.findAll({
            where: { offender_id: student.user_id, deleted: false },
            include: [
                { model: studentBehaviorType, as: 'behaviorType', attributes: ['id', 'name', 'category'] },
            ],
            order: [['behavior_date', 'DESC']],
            attributes: ['id', 'comment', 'behavior_date', 'createdAt'],
        });

        res.status(200).json({ behaviors });
    } catch (error) {
        console.error('getBehaviors Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/v1/parents/evaluations
const getTeacherEvaluations = async (req, res) => {
    try {
        const student_id = req.user.student.id;

        // Get the student's class to find related teachers
        const student = await Student.findOne({
            where: { id: student_id },
            attributes: ['class_id', 'school_id'],
        });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Find teachers who have sessions in the student's class
        const teachers = await Teacher.findAll({
            include: [
                {
                    model: Session,
                    as: 'sessions',
                    where: { class_id: student.class_id },
                    required: true,
                    attributes: ['id'],
                },
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['first_name', 'middle_name', 'last_name'],
                },
            ],
        });

        const teacherIds = teachers.map(t => t.id);

        const evaluations = await TeacherEvaluation.findAll({
            where: { teacher_id: { [Op.in]: teacherIds }, deleted: false },
            include: [
                {
                    model: Teacher,
                    as: 'teacher',
                    include: [
                        {
                            model: Employee,
                            as: 'employee',
                            attributes: ['first_name', 'middle_name', 'last_name'],
                        },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({ evaluations });
    } catch (error) {
        console.error('getTeacherEvaluations Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/v1/parents/supervisor-notes
const getSupervisorNotes = async (req, res) => {
    try {
        const student_id = req.user.student.id;

        // Get student's school
        const student = await Student.findOne({ where: { id: student_id }, attributes: ['school_id'] });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Get employees in the same school (supervisors / social workers)
        const employees = await Employee.findAll({
            where: { organization_id: student.school_id, deleted: false },
            attributes: ['id'],
        });
        const employeeIds = employees.map(e => e.id);

        const notes = await ManagerComment.findAll({
            where: { employee_id: { [Op.in]: employeeIds }, deleted: false },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['first_name', 'middle_name', 'last_name'],
                },
            ],
            order: [['date', 'DESC']],
        });

        res.status(200).json({ notes });
    } catch (error) {
        console.error('getSupervisorNotes Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/v1/parents/news
const getSchoolNews = async (req, res) => {
    try {
        const student_id = req.user.student.id;

        // Get student's school
        const student = await Student.findOne({ where: { id: student_id }, attributes: ['school_id'] });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const news = await PublishedNews.findAll({
            where: { organization_id: student.school_id },
            order: [['date', 'DESC']],
        });

        res.status(200).json({ news });
    } catch (error) {
        console.error('getSchoolNews Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/v1/parents/profile
const getStudentProfile = async (req, res) => {
    try {
        const student_id = req.user.student.id;

        const student = await Student.findOne({
            where: { id: student_id, deleted: false },
            include: [
                { model: Class, as: 'class', attributes: ['id', 'name'] },
                { model: Specialization, as: 'specialization', attributes: ['id', 'name'] },
                {
                    model: Organization,
                    as: 'school',
                    attributes: ['id', 'name', 'city', 'location'],
                },
            ],
        });

        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.status(200).json({
            student: {
                id: student.id,
                name: `${student.first_name} ${student.middle_name} ${student.last_name}`.trim(),
                birth_date: student.birth_date,
                email: student.email,
                class: student.class,
                specialization: student.specialization,
            },
            school: student.school,
        });
    } catch (error) {
        console.error('getStudentProfile Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/v1/parents/points
const getStudentPoints = async (req, res) => {
    try {
        const student_id = req.user.student.id;

        const student = await Student.findOne({ where: { id: student_id }, attributes: ['user_id'] });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Find the user's points record
        const userPoints = await UsersPoints.findOne({
            where: { user_id: student.user_id, deleted: false },
        });

        if (!userPoints) {
            return res.status(200).json({ points: 100, history: [] }); // Default points if no record
        }

        // Get point history
        const history = await PointsHistory.findAll({
            where: { user_id: userPoints.id, deleted: false },
            include: [
                {
                    model: RewardsAndPunishments,
                    as: 'point',
                    attributes: ['name', 'points', 'type'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            points: userPoints.points,
            history,
        });
    } catch (error) {
        console.error('getStudentPoints Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/v1/parents/teachers
const getTeachers = async (req, res) => {
    try {
        const student_id = req.user.student.id;

        const student = await Student.findOne({ where: { id: student_id }, attributes: ['class_id'] });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const teachers = await Teacher.findAll({
            include: [
                {
                    model: Session,
                    as: 'sessions',
                    where: { class_id: student.class_id },
                    required: true,
                    attributes: [],
                },
                {
                    model: Employee,
                    as: 'employee',
                    // attributes: ['first_name', 'middle_name', 'last_name', 'image_path', 'gender'],
                    attributes: ['first_name', 'middle_name', 'last_name'],
                },
                {
                    model: Subject,
                    as: 'subjects',
                    attributes: ['name'],
                },
            ],
            where: { deleted: false },
        });

        res.status(200).json({ teachers });
    } catch (error) {
        console.error('getTeachers Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    parentLogin,
    getStudentProfile,
    getAttendance,
    getGrades,
    getGradesMonthlyProgress,
    getBehaviors,
    getTeacherEvaluations,
    getSupervisorNotes,
    getSchoolNews,
    getStudentPoints,
    getTeachers,
};