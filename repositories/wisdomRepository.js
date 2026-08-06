const db = require('../db/models');
const { Op } = require('sequelize');

exports.fetchWisdomPdmsDashboardData = async (year, systemId, stage, subject, specialization, fromDate, toDate) => {
    // start and end of the selected year
    let startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    let endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    // override start date if provided
    if (fromDate && fromDate !== "All") {
        startOfYear = new Date(`${fromDate}T00:00:00.000Z`);
    }

    // override end date if provided
    if (toDate && toDate !== "All") {
        endOfYear = new Date(`${toDate}T23:59:59.999Z`);
    }

    // 🔍 safety check
    if (startOfYear > endOfYear) {
        throw new Error("Invalid date range: fromDate is after toDate");
    }

    // fetch organization's data that is school type
    const organizations = await db.Organization.findAll({
        attributes: ["id", "name", "location"],
        where: {
            type: "school",
        },
        include: [
            {
                model: db.System,
                as: "systems",
                where: { id: systemId },
                attributes: [],
                through: { attributes: [] }
            }
        ],
        raw: true
    });
    const organizationIds = organizations.map(org => org.id);

    // fetch curriculum's data related to the selected school's ids
    const curriculums = await db.Curriculum.findAll({
        attributes: ["id"],
        raw: true
    });

    // fetch teachers' data related to all related organizations
    const teacherWhere = {};

    if (subject !== "All" && Number.isFinite(Number(subject))) {
        teacherWhere.subject_id = Number(subject);
    }

    const teachers = await db.Teacher.findAll({
        attributes: ['id', 'employee_id', 'planned_sessions', 'actual_sessions'],
        include: [
            {
                model: db.Employee,
                as: "employee",
                where: { organization_id: { [Op.in]: organizationIds } },
                attributes: []
            }
        ],
        where: teacherWhere,
        raw: true
    });

    const teacherEmployeeIds = teachers.map(teacher => teacher.employee_id);
    const teacherEmployees = await db.Employee.findAll({
        attributes: ['id', 'first_name', 'middle_name', 'last_name', 'user_id', "organization_id", "role_id"],
        where: {
            id: {
                [Op.in]: teacherEmployeeIds
            }
        },
        raw: true
    });
    const TeacherUserIds = teacherEmployees.map(s => s.user_id);

    // fetch employees's data related to all related organizations and ebda edu
    const employees = await db.Employee.findAll({
        attributes: ['id', 'first_name', 'middle_name', 'last_name', 'user_id', "organization_id", "role_id"],
        where: {
            organization_id: {
                [Op.in]: organizationIds
            },
            role_id: { [Op.ne]: 1 }
        },
        raw: true
    });
    const ebdaeduEmployees = await db.Employee.findAll({
        attributes: ['id', 'first_name', 'middle_name', 'last_name', 'user_id', "organization_id", "role_id"],
        where: { organization_id: 3 },
        raw: true
    });
    const employeeUserIds = employees.map(s => s.user_id);

    // fetch student's data related to the selected school's ids
    const classInclude = {
        model: db.Class,
        as: "class",
        attributes: [],
    };

    if (stage !== "All" && Number.isFinite(Number(stage))) {
        classInclude.where = { stage_id: Number(stage) };
    }

    const studentWhere = {
        school_id: {
            [Op.in]: organizationIds
        }
    };

    // Optional specialization filter
    if (specialization !== "All" && Number.isFinite(Number(specialization))) {
        studentWhere.specialization_id = Number(specialization);
    }

    const specializationInclude = {
        model: db.Specialization,
        as: "specialization",
        attributes: [],
        required: true
    };

    if (subject !== "All" && Number.isFinite(Number(subject))) {
        specializationInclude.include = [
            {
                model: db.SubjectSpecialization,
                as: "subject",
                attributes: [],
                where: {
                    subject_id: Number(subject)
                },
            }
        ];
    }

    const students = await db.Student.findAll({
        attributes: ['id', 'first_name', 'middle_name', 'last_name', 'user_id', 'school_id'],
        where: studentWhere,
        include: [
            classInclude,
            specializationInclude
        ],
        raw: true
    });

    const studentIds = students.map(s => s.id);
    const studentUserIds = students.map(s => s.user_id);

    // combined users if employees and students
    const usersIds = [...studentUserIds, ...employeeUserIds, ...TeacherUserIds];

    // fetch all reports (curriculum, individualm, environment)
    const allCurriculumReports = await db.CurriculumReport.findAll({
        attributes: ['id', 'Assessor_id', 'organization_id', 'createdAt'],
        where: {
            organization_id: { [Op.in]: organizationIds },
            createdAt: {
                [Op.between]: [startOfYear, endOfYear]
            }
        },
        order: [['createdAt', 'DESC']],
        raw: true
    });
    const curriculumReportIds = allCurriculumReports.map(report => report.id);

    const allIndividualReports = await db.IndividualReport.findAll({
        attributes: ['id', 'Assessor_id', 'Assessee_id', 'createdAt'],
        where: {
            Assessee_id: { [Op.in]: usersIds },
            createdAt: {
                [Op.between]: [startOfYear, endOfYear]
            }
        },
        order: [['createdAt', 'DESC']],
        raw: true
    });
    const individualReportIds = allIndividualReports.map(report => report.id);

    const allEnvironmentReports = await db.EnvironmentReports.findAll({
        attributes: ['id', 'user_id', 'organization_id', 'createdAt'],
        where: {
            organization_id: { [Op.in]: organizationIds },
            createdAt: {
                [Op.between]: [startOfYear, endOfYear]
            }
        },
        raw: true
    });
    const environmentReportIds = allEnvironmentReports.map(report => report.id);

    // fetch all results (curriculum, individual, environment)
    const [allCurriculumResults, allIndividualResults, allEnvironmentResults] = await Promise.all([
        db.CurriculumResult.findAll({
            attributes: ['report_id', 'question_id', 'score'],
            where: { report_id: { [Op.in]: curriculumReportIds } },
            raw: true
        }),
        db.QuestionResult.findAll({
            attributes: ['report_id', 'question_id', 'score'],
            where: { report_id: { [Op.in]: individualReportIds } },
            raw: true
        }),
        db.EnvironmentResults.findAll({
            attributes: ['report_id', 'question_id', 'score'],
            where: { report_id: { [Op.in]: environmentReportIds } },
            raw: true
        })
    ]);

    // fetch all form's details
    const forms = await db.Form.findAll({ attributes: ['id', 'code', 'en_name', 'ar_name'], where: { en_name: systemId === 1 ? { [Op.ne]: "test" } : systemId === 2 ? 'test' : undefined }, raw: true });
    const formIds = forms.map(form => form.id);
    const fields = await db.Field.findAll({ attributes: ['id', 'form_id'], where: { form_id: { [Op.in]: formIds } }, raw: true });
    const fieldIds = fields.map(field => field.id);
    const subFields = await db.SubField.findAll({ attributes: ['id', 'field_id'], where: { field_id: { [Op.in]: fieldIds } }, raw: true });
    const subFieldIds = subFields.map(subField => subField.id);
    const questions = await db.Question.findAll({ attributes: ['id', 'max_score', 'sub_field_id'], where: { sub_field_id: { [Op.in]: subFieldIds } }, raw: true });

    // fetch Student Attendance's data related to selected organizations
    const studentsAttendance = await db.studentAttendance.findAll({
        attributes: ['status', 'student_id', 'createdAt'],
        where: {
            student_id: { [Op.in]: studentIds },
            createdAt: {
                [Op.between]: [startOfYear, endOfYear]
            }
        },
        raw: true
    });

    // fetch Students Behavior's data related to selected organizations
    const studentsBehavior = await db.studentBehavior.findAll({
        attributes: ['id', 'offender_id', 'behavior_date'],
        where: {
            offender_id: { [Op.in]: studentUserIds },
            behavior_date: {
                [Op.between]: [startOfYear, endOfYear]
            }
        },
        raw: true
    });

    // fetch tasks' data related to selected organizations
    const tasks = await db.Task.findAll({
        attributes: ["id", "start_date", "assignee_id", "manager_status", "manager_quality", "manager_speed", "reviewer_status", "reviewer_quality", "reviewer_speed"],
        include: [
            {
                model: db.User,
                as: "assignee",
                attributes: ["code"],
                required: true,
                include: [
                    {
                        model: db.Employee,
                        as: "employee",
                        attributes: ["first_name", "middle_name", "last_name", "organization_id"],
                        required: true
                    }
                ]
            }
        ],
        where: {
            assignee_id: { [Op.in]: [...employeeUserIds, ...TeacherUserIds] },
            createdAt: {
                [Op.between]: [startOfYear, endOfYear]
            }
        },
        raw: true
    });

    return {
        organizations, curriculums,
        ebdaeduEmployees, employees: [...employees, ...teacherEmployees], teachers, students,
        allCurriculumResults, allIndividualResults, allEnvironmentResults,
        allCurriculumReports, allIndividualReports, allEnvironmentReports,
        forms, fields, subFields, questions,
        studentsAttendance, studentsBehavior, tasks
    };
};

exports.fetchWisdomGradebookScores = async (id) => {
    return await db.QuizTest.findAll({
        include: [
            {
                model: db.Student,
                as: "student",
                required: true,
            }
        ],
        where: { template_id: id },
        distinct: true,
        order: [["createdAt", "DESC"]],
    });
};

exports.fetchDashboardQuizTest = async (year, students, teachers, fromDate, toDate) => {
    // start and end of the selected year
    let startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    let endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));


    // override start date if provided
    if (fromDate && fromDate !== "All") {
        startOfYear = new Date(`${fromDate}T00:00:00.000Z`);
    }

    // override end date if provided
    if (toDate && toDate !== "All") {
        endOfYear = new Date(`${toDate}T23:59:59.999Z`);
    }

    // safety check
    if (startOfYear > endOfYear) {
        throw new Error("Invalid date range: fromDate is after toDate");
    }

    const studentIds = students.map(s => s.id);
    const TeacherUserIds = teachers.map(s => s.id);

    // fetch Student Quizes and test's data related to selected organizations
    const quizesTests = await db.QuizTest.findAll({
        attributes: ['student_id', 'teacher_id', 'createdAt', 'result'],
        include: [
            {
                model: db.QuizzesTestsTemplate,
                as: "template",
                required: true,
                include: [
                    {
                        model: db.Subject,
                        as: "subject",
                        required: true,
                    }
                ],
                where: {
                    start_date: {
                        [Op.between]: [startOfYear, endOfYear]
                    },
                    end_date: {
                        [Op.between]: [startOfYear, endOfYear]
                    }
                }
            }
        ],
        where: {
            teacher_id: { [Op.in]: TeacherUserIds },
            student_id: { [Op.in]: studentIds },
        },
        // where: {
        //     student_id: { [Op.in]: studentIds },
        //     createdAt: {
        //         [Op.between]: [startOfYear, endOfYear]
        //     }
        // },
    });

    return quizesTests
}

exports.fetchTeachersDashboardData = async (orgId) => {
    const wisdomTeachers = await db.Employee.findAll({
        where: { role_id: 1 },
        include: [
            {
                model: db.Organization,
                as: "organization",
                where: { type: "school", id: orgId },
            }
        ]
    });
    const teachersUserId = wisdomTeachers.map(emp => emp.user_id);
    return await db.IndividualReport.findAll({
        attributes: ["id", "Assessor_id", "Assessee_id", "createdAt"],
        where: { Assessee_id: teachersUserId },
        include: [
            {
                model: db.QuestionResult,
                as: "results",
                attributes: ["id", "score"],
                required: true,
                include: [
                    {
                        model: db.Question,
                        as: "question",
                        attributes: ["id", "weight", "max_score"],
                        required: true,
                        include: [
                            {
                                model: db.SubField,
                                as: "sub_field",
                                attributes: ["id", "weight"],
                                required: true,
                                include: [
                                    {
                                        model: db.Field,
                                        as: "field",
                                        attributes: ["id", "weight"],
                                        required: true,
                                        include: [
                                            {
                                                model: db.Form,
                                                as: "form",
                                                attributes: ["id", "code", "weight"],
                                                required: true,
                                                where: { code: { [Op.like]: "%T" }, type: "360 Individual Assessment" },
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                model: db.User,
                as: "assessee",
                attributes: ["id"],
                include: [
                    {
                        model: db.Employee,
                        as: "employee",
                        attributes: ["id", "first_name", "middle_name", "last_name", "organization_id"],
                        include: [
                            {
                                model: db.Teacher,
                                as: "teacher",
                                attributes: ["id"],
                                include: [
                                    {
                                        model: db.Department,
                                        as: "department",
                                        attributes: ["id", "Name"],
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });
};

exports.insertNewClassRoomDocument = async (data, uploadedDocumentId) => {
    return await db.ClassroomUpload.create({
        classroom_id: data.classroom_id,
        upload_id: uploadedDocumentId,
        user_id: data.user_id,
    });
};

exports.fetchClassRoomUploadsDetails = async (classroom_id) => {
    return await db.Upload.findAll({
        attributes: ["id", "file_path", "createdAt"],
        include: [
            {
                model: db.ClassroomUpload,
                as: "classroom_uploads",
                where: { classroom_id },
                required: true,
            },
        ]

    });
};

exports.insertUploadIdImageToUser = async (data, uploadedDocumentId) => {
    return await db.User.update(
        { upload_id: uploadedDocumentId },
        { where: { id: data.user_id } }
    );
};

exports.fetchUserImageDetails = async (user_id) => {
    return await db.Upload.findOne({
        attributes: ["id", "file_path", "createdAt"],
        include: [
            {
                model: db.User,
                as: "users",
                where: { id: user_id },
                required: true,
            },
        ]
    });
};