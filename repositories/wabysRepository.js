const db = require('../db/models');
const { Op } = require('sequelize');

exports.fetchDashboardData = async (year, systemId, stage, subject, specialization, fromDate, toDate) => {
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

    // if (subject !== "All" && Number.isFinite(Number(subject))) {
    //     teacherWhere.subject_id = Number(subject);
    // }

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

    const seniorClassInclude = {
        ...classInclude,
        where: {
            ...(classInclude.where || {}),
            stage_id: 3
        }
    };

    const seniorStudents = await db.Student.findAll({
        attributes: [
            'id',
            'first_name',
            'middle_name',
            'last_name',
            'user_id',
            'school_id'
        ],
        where: studentWhere,
        include: [
            seniorClassInclude,
            specializationInclude
        ],
        raw: true
    });

    const studentIds = students.map(s => s.id);
    const seniorStudentIds = seniorStudents.map(s => s.id);
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

    const seniorStudentsAttendance = await db.studentAttendance.findAll({
        attributes: ['status', 'student_id', 'createdAt'],
        where: {
            student_id: { [Op.in]: seniorStudentIds },
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

    const teachersEvaluation = await db.TeacherEvaluation.findAll({
        attributes: ['teacher_id', 'first_result', 'second_result', 'third_result', 'fourth_result', 'fifth_result', 'sixth_result', 'createdAt'],
        raw: true
    });

    return {
        organizations, curriculums,
        ebdaeduEmployees, employees: [...employees, ...teacherEmployees], teachers, students,
        allCurriculumResults, allIndividualResults, allEnvironmentResults,
        allCurriculumReports, allIndividualReports, allEnvironmentReports,
        forms, fields, subFields, questions,
        studentsAttendance, seniorStudentsAttendance, studentsBehavior, tasks, teachersEvaluation
    };
};

exports.fetchDashboardGeneralInfoData = async (systemId) => {

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

    const schools = await db.School.findAll({
        attributes: ["no_of_workshops", "no_of_labs", "no_of_classes", "organizationId"],
        where: { organizationId: organizationIds }
    })

    const teachers = await db.Teacher.findAll({
        attributes: ['id', 'employee_id'],
        include: [
            {
                model: db.Employee,
                as: "employee",
                where: { organization_id: { [Op.in]: organizationIds } },
                attributes: []
            },
            {
                model: db.Subject,
                as: "subjects",
                attributes: ["id"]
            }
        ],
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

    const students = await db.Student.findAll({
        attributes: ['id', 'first_name', 'middle_name', 'last_name', 'user_id', 'school_id', 'specialization_id'],
        where: {
            school_id: {
                [Op.in]: organizationIds
            }
        },
        raw: true
    });

    const subjects = await db.Subject.findAll({
        attributes: ['id', 'name'],
        raw: true
    });

    const specializations = await db.Specialization.findAll({
        attributes: ['id', 'name'],
        raw: true
    });

    const classRooms = await db.ClassRoom.findAll({
        where: {
            organization_id: {
                [Op.in]: organizationIds
            }
        },
    });

    return {
        organizations, schools, employees: [...employees, ...teacherEmployees], teachers, students, subjects, specializations, classRooms
    };
};

exports.fetchWatomsTrainersRegistrationsData = async () => {
    const registrations = await db.TrainersRegistrationsData.findAll({
        order: [["created_at", "DESC"]],
        include: [
            {
                model: db.Subject,
                as: "subject",
                attributes: ["name"],
            },
        ],
    });

    return registrations;
};

exports.fetchRelatedSchoolsPerSystemData = async (systemId) => {
    return db.Organization.findAll({
        attributes: ["id", "name"],
        include: [
            {
                model: db.System,
                as: "systems",
                where: { id: systemId },
                attributes: [],
                through: { attributes: [] }
            }
        ],
        where: { type: 'school' },
    });
};

exports.fetchSystemRelatedEmployees = async (systemId) => {
    const users = await db.User.findAll({
        attributes: ["id", "code"],
        include: [
            {
                model: db.Employee,
                as: "employee",
                required: true,
                attributes: ["id", "first_name", "middle_name", "last_name", "organization_id", "role_id"],
                include: [
                    {
                        model: db.Teacher,
                        as: "teacher",
                        required: false, // allow null = LEFT OUTER JOIN
                        attributes: ["id"],
                    },
                    {
                        model: db.Organization,
                        as: "organization",
                        where: { type: "school" },
                        required: true,
                        attributes: ["id"],
                        include: [
                            {
                                model: db.System,
                                as: "systems",
                                where: { id: systemId },
                                attributes: [],
                                through: { attributes: [] }
                            }
                        ]
                    }
                ],
            },
        ],
        where: {
            '$employee.teacher.id$': null, // only users where employee has no teacher
        },
    });
    return users
};

exports.fetchAllStagesData = async () => {
    const stages = await db.Stage.findAll({
        attributes: ["id", "name"],
        include: [
            {
                model: db.Class,
                as: "classes",
                attributes: ["id", "name"],
                include: [
                    {
                        model: db.Student,
                        as: "students",
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Specialization,
                                as: "specialization",
                                attributes: ["id", "name"]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    return stages;
};

exports.fetchAllSubjectsData = async () => {
    const subjects = await db.Subject.findAll({
        attributes: ["id", "name"],
        include: [
            {
                model: db.SubjectSpecialization,
                as: 'specializations',
                attributes: ["id"],
                include: [
                    {
                        model: db.Specialization,
                        as: 'specialization',
                        attributes: ['id', 'name'],
                        include: [
                            {
                                model: db.Student,
                                as: "students",
                                attributes: ["id"],
                                include: [
                                    {
                                        model: db.Class,
                                        as: "class",
                                        attributes: ["stage_id"]
                                    }
                                ]
                            }
                        ]
                    },
                ],
            },
        ],
    });

    return subjects
};

exports.fetchAllSpecializationsData = async () => {
    const specializations = await db.Specialization.findAll({
        attributes: ["id", "name"],
        include: [
            {
                model: db.SubjectSpecialization,
                as: 'subject',
                attributes: ["id"],
                include: [
                    {
                        model: db.Subject,
                        as: 'subject',
                        attributes: ['id', 'name'],
                    },
                ],
            },
            {
                model: db.Student,
                as: "students",
                attributes: ["id"],
                include: [
                    {
                        model: db.Class,
                        as: "class",
                        attributes: ["stage_id"]
                    }
                ]
            }
        ],
    });

    return specializations
};

exports.fetchAllCurriculumsPerSystemData = async (systemId) => {
    return db.Curriculum.findAll({
        distinct: true,
        attributes: ["id", "code"],
        include: [
            {
                model: db.Subject,
                as: 'subject',
                attributes: ["id"],
                required: true,
                include: [
                    {
                        model: db.SubjectSpecialization,
                        as: 'specializations',
                        attributes: ['id'],
                        required: true,
                        include: [
                            {
                                model: db.Specialization,
                                as: 'specialization',
                                attributes: ['id'],
                                required: true,
                                include: [
                                    {
                                        model: db.Organization,
                                        as: 'organizations',
                                        where: { type: 'school' },
                                        required: true,
                                        through: { attributes: [] },
                                        include: [],
                                        where: { authority_id: 2 }
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

exports.fetchRelatedSubjectsPerSystemData = async (systemId) => {
    return db.Subject.findAll({
        distinct: true,
        attributes: ["id", "name"],
        include: [
            {
                model: db.SubjectSpecialization,
                as: 'specializations',
                attributes: ['id'],
                required: true,
                include: [
                    {
                        model: db.Specialization,
                        as: 'specialization',
                        attributes: ['id'],
                        required: true,
                        include: [
                            {
                                model: db.Organization,
                                as: 'organizations',
                                where: { type: 'school' },
                                required: true,
                                through: { attributes: [] },
                                include: [],
                                where: { authority_id: 2 }
                            }
                        ]
                    }
                ]
            }
        ]
    });
};

exports.fetchRelatedFormsData = async () => {
    const forms = await db.Form.findAll({
        attributes: ["id", "en_name", "ar_name", "code", "type"],
        include: [
            {
                model: db.Program,
                as: "programs",
                attributes: ["id", "name"]
            },
            {
                model: db.SubjectFormCategory,
                as: "category",
                attributes: ["id", "name"]
            }
        ]
    });

    return forms
};

exports.insertNewGradebookData = async (data) => {
    const gradebook = await db.QuizzesTestsTemplate.create(data);

    return gradebook
};

exports.fetchSystemRelatedGradebooksData = async (systemId) => {
    const gradebook = await db.QuizzesTestsTemplate.findAll({
        distinct: true,
        // attributes: [],
        include: [
            {
                model: db.Organization,
                as: "organization",
                where: { type: "school" },
                required: true,
                attributes: ["id"],
                include: [
                    {
                        model: db.System,
                        as: "systems",
                        where: { id: systemId },
                        attributes: [],
                        through: { attributes: [] }
                    }
                ]
            }
        ]
    });

    return gradebook
};

exports.insertGradebookScoreData = async (data) => {
    if (Array.isArray(data)) {
        const gradebooks = await db.QuizTest.bulkCreate(data);
        return gradebooks;
    }

    const gradebook = await db.QuizTest.create(data);
    return gradebook;
};

exports.insertTeacherAbsenceData = async (data) => {
    return await db.TeacherAbsence.create(data);
};

exports.insertNewClassData = async (data) => {
    return await db.Class.create(data);
};

exports.fetchWatomsCoursesDetailsData = async () => {
    const courses = await db.Class.findAll({
        include: [
            {
                model: db.ClassRoom,
                as: "classRoom",
                include: [
                    {
                        model: db.Organization,
                        as: "organization"
                    }
                ]
            },
            {
                model: db.Specialization,
                as: "specialization",
            },
            {
                model: db.Session,
                as: "sessions",
                include: [
                    {
                        model: db.Teacher,
                        as: "teacher",
                        include: [
                            {
                                model: db.Employee,
                                as: "employee"
                            }
                        ]
                    }
                ]
            }
        ],
        order: [["createdAt", "DESC"]],
    });

    return courses;
};

exports.updateClassRowData = async (id, updateData) => {
    const existing = await db.Class.findByPk(id);
    if (!existing) return null;

    const allowedFields = [
        "name",
        "specialization_id",
        "no_of_male_students",
        "no_of_female_students",
        "start_date",
        "end_date",
        "status",
        "hours",
    ];

    const sanitized = {};
    for (const key of allowedFields) {
        if (updateData[key] !== undefined) sanitized[key] = updateData[key];
    }

    await existing.update(sanitized);
    return existing;
};

exports.updateClassRoomRowData = async (id, updateData) => {
    const existing = await db.ClassRoom.findByPk(id);
    if (!existing) return null;

    const allowedFields = [
        "organization_id",
        "room_type"
    ];

    const sanitized = {};
    for (const key of allowedFields) {
        if (updateData[key] !== undefined) sanitized[key] = updateData[key];
    }

    await existing.update(sanitized);
    return existing;
};

exports.deleteClassRowData = async (id) => {
    const existing = await db.Class.findByPk(id);

    if (!existing) return null;

    await existing.destroy();

    return existing;
};

exports.insertNewClassRoomData = async (data) => {
    return await db.ClassRoom.create(data);
};

exports.fetchSystemRelatedSpecializations = async (systemId) => {
    return await db.Specialization.findAll({
        include: [
            {
                model: db.Organization,
                as: "organizations",
                required: true,
                attributes: ["id"],
                through: { attributes: [] },
                include: [
                    {
                        model: db.System,
                        as: "systems",
                        required: true,
                        where: { id: systemId },
                        attributes: [],
                        through: { attributes: [] },
                    },
                ],
            },
        ],
        distinct: true,
        order: [["createdAt", "DESC"]],
    });
};

exports.fetchSystemRelatedSubjects = async (systemId) => {
    return await db.Subject.findAll({
        include: [
            {
                model: db.Teacher,
                as: "teachers",
                required: true,
                attributes: ["id"],
                include: [
                    {
                        model: db.Employee,
                        as: "employee",
                        required: true,
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Organization,
                                as: "organization",
                                required: true,
                                attributes: ["id", "name"],
                                include: [
                                    {
                                        model: db.System,
                                        as: "systems",
                                        required: true,
                                        where: { id: systemId },
                                        attributes: [],
                                        through: { attributes: [] },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        distinct: true,
        order: [["createdAt", "DESC"]],
    });
};

exports.fetchSystemRelatedClassRooms = async (systemId) => {
    return await db.ClassRoom.findAll({
        include: [
            {
                model: db.Organization,
                as: "organization",
                required: true,
                attributes: [],
                include: [
                    {
                        model: db.System,
                        as: "systems",
                        required: true,
                        where: { id: systemId },
                        attributes: [],
                        through: { attributes: [] },
                    },
                ],
            },
        ],
        distinct: true,
        order: [["createdAt", "DESC"]],
    });
};

exports.fetchSystemSurvey = async () => {
    return await db.SystemSurveyField.findAll({
        attributes: ["id", "name"],
        include: [
            {
                model: db.SystemSurveyQuestion,
                as: "questions",
                required: true,
                attributes: ["id", "name"],
                include: [
                    {
                        model: db.SystemSurveyAnswer,
                        as: "answers",
                        required: true,
                        attributes: ["id", "name"],
                    },
                ],
            },
        ],
        distinct: true,
        order: [["id", "ASC"]],
    });
};

exports.insertSystemSurvey = async (data) => {
    const { user_id, answers } = data;

    if (!user_id) throw new Error("user_id is required");
    if (!Array.isArray(answers) || answers.length === 0) {
        throw new Error("answers must be a non-empty array");
    }

    // extract answer ids from [{ answer_id: 1 }, ...]
    const answerIds = answers
        .map((a) => a?.answer_id)
        .filter((v) => Number.isInteger(v));

    if (answerIds.length === 0) throw new Error("No valid answer_id values provided");

    return await db.sequelize.transaction(async (t) => {
        // 1) create survey row
        const survey = await db.ManagersSurvey.create(
            { user_id },
            { transaction: t }
        );

        // 2) bulk insert selected answers
        const rows = answerIds.map((answer_id) => ({
            survey_id: survey.id,
            answer_id,
        }));

        await db.ManagersSurveysAnswer.bulkCreate(rows, { transaction: t });

        // return something useful
        return {
            survey_id: survey.id,
            user_id,
            inserted_answers_count: rows.length,
        };
    });
};

exports.fetchSystemRelatedMentors = async (systemId) => {
    return await db.Employee.findAll({
        attributes: ["id", "first_name", "middle_name", "last_name", "user_id"],
        where: { role_id: 1 },
        include: [
            {
                model: db.teacher,
                as: "teacher",
                attributes: ["id"],
                include: [
                    {
                        model: db.Session,
                        as: "sessions",
                        attributes: ["class_id"]
                    }
                ]
            }
        ],
        distinct: true,
        order: [["id", "ASC"]],
    });
};

exports.fetchAllAuthorityData = async () => {
    return await db.Authority.findAll({
        attributes: ["id", "name"],
        order: [["id", "ASC"]],
    });
};

exports.fetchSystemRelatedStudentsOrTrainees = async (systemId) => {
    return await db.Student.findAll({
        include: [
            {
                model: db.Organization,
                as: "school",
                required: true,
                attributes: [],
                include: [
                    {
                        model: db.System,
                        as: "systems",
                        required: true,
                        where: { id: systemId },
                        attributes: [],
                        through: { attributes: [] },
                    },
                ],
            },
        ],
        distinct: true,
        order: [["createdAt", "DESC"]],
    });
};

exports.fetchSystemRelatedTeachersOrTrainers = async (systemId) => {
    return await db.Teacher.findAll({
        include: [
            {
                model: db.Employee,
                required: true,
                as: "employee",
                include: [
                    {
                        model: db.Organization,
                        as: "organization",
                        required: true,
                        attributes: [],
                        include: [
                            {
                                model: db.System,
                                as: "systems",
                                required: true,
                                where: { id: systemId },
                                attributes: [],
                                through: { attributes: [] },
                            },
                        ],
                    },
                ],
            },
            {
                model: db.Subject,
                as: "subjects",
                required: true,
                attributes: ["id"],
                through: { attributes: [] },
            },
        ],
        distinct: true,
        order: [["createdAt", "DESC"]],
    });
};

exports.fetchSystemRelatedClasses = async (systemId) => {
    return await db.Class.findAll({
        include: [
            {
                model: db.ClassRoom,
                as: "classRoom",
                required: true,
                attributes: ["id", "organization_id"],
                include: [
                    {
                        model: db.Organization,
                        as: "organization",
                        required: true,
                        attributes: [],
                        include: [
                            {
                                model: db.System,
                                as: "systems",
                                required: true,
                                where: { id: systemId },
                                attributes: [],
                                through: { attributes: [] },
                            },
                        ],
                    },
                ],
            }
        ],
        distinct: true,
        order: [["createdAt", "DESC"]],
    });
};

exports.fetchSystemRelatedDepartments = async (systemId) => {
    return await db.Department.findAll({
        include: [
            {
                model: db.Teacher,
                as: "teachers",
                required: true,
                attributes: ["id"],
                include: [
                    {
                        model: db.Employee,
                        as: "employee",
                        required: true,
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Organization,
                                as: "organization",
                                required: true,
                                attributes: ["id", "name"],
                                include: [
                                    {
                                        model: db.System,
                                        as: "systems",
                                        required: true,
                                        where: { id: systemId },
                                        attributes: [],
                                        through: { attributes: [] },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        distinct: true,
        order: [["createdAt", "DESC"]],
    });
};

exports.fetchRelatedOrganizationsPerSystemData = async (systemId) => {
    return await db.Organization.findAll({
        attributes: ["id", "name", "city", "authority_id"],
        include: [
            {
                model: db.System,
                as: "systems",
                where: { id: systemId },
                attributes: [],
                through: { attributes: [] }
            }
        ],
    });
};

exports.fetchTeacherEmployeeDepartmentsData = async () => {
    const employeeDepartments = await db.EmployeeDepartment.findAll({
        attributes: ["id", "name"],
    });
    const teacherDepartments = await db.Department.findAll({
        attributes: ["id", "Name"],
    });

    return {employeeDepartments, teacherDepartments}
};

exports.fetchClassRoomDetails = async (id) => {
    const details = await db.ClassroomEquipment.findAll({
        where: { classroom_id: id },
    });
    const classroom = await db.ClassRoom.findOne({
        where: { id },
    });
    return { classroom, details }
};

exports.insertNewUploadData = async (storedPath) => {
    return uploadDocument = await db.Upload.create({
        file_path: storedPath,
    });
}