const db = require('../db/models');
const { Op } = require('sequelize');

exports.fetchWatomsForms = async () => {
    const pedagogicalTest = await db.Exam.findOne({
        attributes: ["id", "name", "code"],
        where: { code: "PDMS" }
    })
    const forms = await db.Form.findAll({
        attributes: ["id", "ar_name", "code"],
        where: {
            id: {
                [Op.or]: [37, 83]
            }
        }
    });
    const allForms = [...forms, pedagogicalTest];
    return allForms
};

exports.fetchWisdomForms = async () => {
    const pedagogicalTest = await db.Exam.findOne({
        attributes: ["id", "name", "code"],
        where: { code: "PDMS" }
    })
    const forms = await db.Form.findAll({
        attributes: ["id", "en_name", "ar_name", "code"],
        where: {
            id: {
                [Op.or]: [1, 5, 84]
            }
        }
    });
    const allForms = [...forms, pedagogicalTest];
    return allForms
};

exports.fetchPedagogicalTest = async () => {
    return await db.Exam.findOne({
        attributes: ["id", "name", "code"],
        include: [
            {
                model: db.ExamField,
                as: "fields",
                attributes: ["id", "name"],
                include: [
                    {
                        model: db.McqQuestion,
                        as: "questions",
                        attributes: ["id", "name"],
                        include: [
                            {
                                model: db.McqChoice,
                                as: "choices",
                                attributes: ["id", "name", "status"]
                            }
                        ]
                    }
                ]
            }
        ],
        where: { code: "PDMS" }
    })
};

exports.fetchWisdomPdmsDashboardData = async () => {
    const pedagogicalTests = await db.McqExam.findAll({
        attributes: ["id", "user_id", "exam_id", "createdAt"],
        include: [
            {
                model: db.McqAnswer,
                as: "answers",
                attributes: ["id", "choice_id", "question_id"],
                include: [
                    {
                        model: db.McqQuestion,
                        as: "question",
                        attributes: ["id", "name", "createdAt"]
                    },
                    {
                        model: db.McqChoice,
                        as: "choice",
                        attributes: ["id", "name", "status", "createdAt"]
                    }
                ]
            }
        ]
    })
    const interviewTests = await db.TeacherEvaluation.findAll({
        attributes: ["id", "employee_id", "first_result", "second_result", "third_result", "fourth_result", "fifth_result", "sixth_result", "createdAt"],
    })
    const forms = await db.IndividualReport.findAll({
        attributes: ["id", "Assessor_id", "Assessee_id", "note", "comment", "createdAt"],
        include: [
            {
                model: db.QuestionResult,
                as: "results",
                required: true,
                attributes: ["id", "score", "question_id", "createdAt"],
                include: [
                    {
                        model: db.Question,
                        as: "question",
                        required: true,
                        attributes: ["id", "ar_name", "weight", "max_score", "sub_field_id", "createdAt"],
                        include: [
                            {
                                model: db.SubField,
                                as: "sub_field",
                                required: true,
                                attributes: ["id", "ar_name", "weight", "field_id", "createdAt"],
                                include: [
                                    {
                                        model: db.Field,
                                        as: "field",
                                        required: true,
                                        attributes: ["id", "ar_name", "weight", "form_id", "createdAt"],
                                        include: [
                                            {
                                                model: db.Form,
                                                as: "form",
                                                required: true,
                                                attributes: ["id", "ar_name", "weight", "code", "createdAt"],
                                                where: {
                                                    id: { [Op.in]: [37, 83] }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });
    return {
        pedagogicalTests: pedagogicalTests,
        interviews: interviewTests,
        forms: forms
    }
};

exports.fetchWatomsPdmsDashboardData = async () => {
    const pedagogicalTests = await db.McqExam.findAll({
        attributes: ["id", "user_id", "exam_id", "createdAt"],
        include: [
            {
                model: db.User,
                as: "user",
                attributes: [],
                required: true,
                include: [
                    {
                        model: db.Employee,
                        as: "employee",
                        attributes: [],
                        required: true,
                        where: {
                            organization_id: {
                                [Op.in]: [4, 5, 7, 8, 9],
                            },
                        },
                    },
                ],
            },
            {
                model: db.McqAnswer,
                as: "answers",
                attributes: ["id", "choice_id", "question_id"],
                include: [
                    {
                        model: db.McqQuestion,
                        as: "question",
                        attributes: ["id", "name", "field_id", "createdAt"]
                    },
                    {
                        model: db.McqChoice,
                        as: "choice",
                        attributes: ["id", "name", "status", "createdAt"]
                    }
                ]
            }
        ]
    })
    const interviewTests = await db.TeacherEvaluation.findAll({
        attributes: ["id", "employee_id", "first_result", "second_result", "third_result", "fourth_result", "fifth_result", "sixth_result", "createdAt"],
        include: [
            {
                model: db.Employee,
                as: "employee",
                attributes: ["user_id"],
                required: true,
                // where: {
                //     organization_id: {
                //         [Op.in]: [4, 5, 7, 8, 9],
                //     },
                // },
            }
        ]
    })
    const forms = await db.IndividualReport.findAll({
        attributes: ["id", "Assessor_id", "Assessee_id", "note", "comment", "createdAt"],
        include: [
            {
                model: db.User,
                as: "assessee",
                attributes: [],
                required: true,
                include: [
                    {
                        model: db.Employee,
                        as: "employee",
                        attributes: [],
                        required: true,
                        where: {
                            organization_id: {
                                [Op.in]: [4, 5, 7, 8, 9],
                            },
                        },
                    },
                ],
            },
            {
                model: db.QuestionResult,
                as: "results",
                required: true,
                attributes: ["id", "score", "question_id", "createdAt"],
                include: [
                    {
                        model: db.Question,
                        as: "question",
                        required: true,
                        attributes: ["id", "ar_name", "weight", "max_score", "sub_field_id", "createdAt"],
                        include: [
                            {
                                model: db.SubField,
                                as: "sub_field",
                                required: true,
                                attributes: ["id", "ar_name", "weight", "field_id", "createdAt"],
                                include: [
                                    {
                                        model: db.Field,
                                        as: "field",
                                        required: true,
                                        attributes: ["id", "ar_name", "weight", "form_id", "createdAt"],
                                        include: [
                                            {
                                                model: db.Form,
                                                as: "form",
                                                required: true,
                                                attributes: ["id", "ar_name", "weight", "code", "createdAt"],
                                                where: {
                                                    id: { [Op.in]: [37, 38, 83, 84, 85, 86] }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });
    return {
        pedagogicalTests: pedagogicalTests,
        interviews: interviewTests,
        forms: forms
    }
};