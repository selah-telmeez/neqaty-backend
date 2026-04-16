const db = require('../db/models');
const { Op } = require("sequelize");

exports.insertTrainersRegistrationForm = async (data) => {
    return db.TrainersRegistrationsData.create(data);
};

exports.fetchTrainingEnvironmentPerformanceReportData = async (year, month, vtcs, workshops) => {
    const trainingEnvironmentForm = await db.Form.findOne({
        attributes: ["id", "ar_name"],
        where: { code: "OEL | TE" },
        include: [
            {
                model: db.Field,
                as: "fields",
                required: true,
                include: [
                    {
                        model: db.SubField,
                        as: "sub_fields",
                        required: true,
                        include: [
                            {
                                model: db.Question,
                                as: "questions",
                                required: true
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (!trainingEnvironmentForm) return [];

    const start = new Date(year, 0, 1, 0, 0, 0, 0); // Jan 1, 00:00
    const end = new Date(year, 4, 1, 0, 0, 0, 0); // May 1, 00:00

    const where = {
        createdAt: {
            [Op.gte]: start,
            [Op.lt]: end,
        },
    };

    // filter by VTCs (organization_id)
    if (vtcs && vtcs !== "") {
        where.organization_id = Number(vtcs);
    }

    // filter by workshops (curriculum_id)
    if (workshops && workshops !== "") {
        where.curriculum_id = Number(workshops);
    }

    const trainingEnvironmentReports = await db.CurriculumReport.findAll({
        where,
        include: [
            {
                model: db.CurriculumResult,
                as: "results",
                required: true,
                include: [
                    {
                        model: db.Question,
                        as: "questionResult",
                        attributes: ["max_score"],
                        required: true,
                        include: [
                            {
                                model: db.SubField,
                                as: "sub_field",
                                attributes: ["id"],
                                required: true,
                                include: [
                                    {
                                        model: db.Field,
                                        as: "field",
                                        attributes: ["id", "ar_name"],
                                        required: true,
                                        where: { form_id: trainingEnvironmentForm.id },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        order: [["createdAt", "DESC"]],
    });

    return {
        trainingEnvironmentForm,
        trainingEnvironmentReports,
    };
};

exports.fetchBFPerformanceReportData = async (year, month, vtcs) => {
    const bfForm = await db.Form.findOne({
        attributes: ["id", "ar_name"],
        where: { code: "OEL | BF" },
        include: [
            {
                model: db.Field,
                as: "fields",
                required: true,
                include: [
                    {
                        model: db.SubField,
                        as: "sub_fields",
                        required: true,
                        include: [
                            {
                                model: db.Question,
                                as: "questions",
                                required: true
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (!bfForm) return [];

    const start = new Date(year, 0, 1, 0, 0, 0, 0); // Jan 1, 00:00
    const end = new Date(year, 4, 1, 0, 0, 0, 0); // May 1, 00:00

    const where = {
        createdAt: {
            [Op.gte]: start,
            [Op.lt]: end,
        },
    };

    // filter by VTCs (organization_id)
    if (vtcs && vtcs !== "") {
        where.organization_id = Number(vtcs);
    }

    const bfReports = await db.EnvironmentReports.findAll({
        where,
        include: [
            {
                model: db.EnvironmentResults,
                as: "results",
                required: true,
                include: [
                    {
                        model: db.Question,
                        as: "questionResult",
                        attributes: ["max_score"],
                        required: true,
                        include: [
                            {
                                model: db.SubField,
                                as: "sub_field",
                                attributes: ["id"],
                                required: true,
                                include: [
                                    {
                                        model: db.Field,
                                        as: "field",
                                        attributes: ["id", "ar_name"],
                                        required: true,
                                        where: { form_id: bfForm.id },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        order: [["createdAt", "DESC"]],
    });

    return {
        bfForm,
        bfReports: bfReports || [],
    };
};