const db = require('../db/models');
const { Op } = require("sequelize");
require("dotenv").config();
const monthsArabic = require('../utils/months');
const roundNumber = require('../utils/roundNumber');
const tmsService = require('../services/tmsService');

// temp comment for pushing code 2
const groupTasksByMonth = (tasks, monthsArabic) => {
    return Object.values(
        tasks.reduce((acc, task) => {
            const month = new Date(task.start_date).getMonth();
            const monthNumber = month + 1;
            const monthName = monthsArabic.monthsArabic[month];

            if (!acc[monthNumber]) {
                acc[monthNumber] = {
                    month: monthName,
                    monthNumber,
                    tasks: [],
                };
            }

            acc[monthNumber].tasks.push(task);
            return acc;
        }, {})
    ).sort((a, b) => a.monthNumber - b.monthNumber);
};

exports.allMyTasks = async (req, res) => {
    try {
        const { id, system } = req.params;
        const numericId = Number(id);

        if (!numericId || isNaN(numericId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid user ID provided",
            });
        }

        const myTasks = await db.Task.findAll({
            where: {
                system,
                [Op.or]: [
                    { assignee_id: numericId },
                    { assigner_id: numericId },
                    { reviewer_id: numericId },
                    { manager_id: numericId }
                ]
            },
            order: [["createdAt", "DESC"]],
            include: [
                ...["assigner", "assignee", "reviewer", "manager"].map((role) => ({
                    model: db.User,
                    as: role,
                    required: true,
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Employee,
                            as: "employee",
                            required: true,
                            attributes: ["id", "first_name", "middle_name", "last_name"],
                        },
                    ],
                })),
                ...[
                    { model: db.Organization, as: "organization" },
                    { model: db.Program, as: "program" },
                    { model: db.Project, as: "project" },
                    { model: db.Authority, as: "authority" },
                ].map(({ model, as }) => ({
                    model,
                    as,
                    required: true,
                    attributes: ["id", "name"],
                })),
                {
                    model: db.TaskDetail,
                    as: "details",
                    attributes: ["id", "order", "title", "description", "note", "status", "end_date"],
                },
            ]
        });
        const myAssigneeTasks = myTasks.filter(task => task.assignee_id === numericId);
        const myAssignerTasks = myTasks.filter(task => task.assigner_id === numericId);
        const myReviewerTasks = myTasks.filter(task => task.reviewer_id === numericId);
        const myManagerTasks = myTasks.filter(task => task.manager_id === numericId);
        const groupedAssigneeTasks = groupTasksByMonth(myAssigneeTasks, monthsArabic);
        const groupedAssignerTasks = groupTasksByMonth(myAssignerTasks, monthsArabic);
        const groupedReviewerTasks = groupTasksByMonth(myReviewerTasks, monthsArabic);
        const groupedManagerTasks = groupTasksByMonth(myManagerTasks, monthsArabic);
        res.status(200).json({
            status: "success",
            message: "my tasks got fetched successfully",
            myTasks: {
                myAssigneeTasks: groupedAssigneeTasks,
                myAssignerTasks: groupedAssignerTasks,
                myReviewerTasks: groupedReviewerTasks,
                myManagerTasks: groupedManagerTasks
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.myTasksDashboard = async (req, res) => {
    try {
        const { id, system } = req.params;
        const numericId = Number(id);

        if (!numericId || isNaN(numericId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid user ID provided",
            });
        }

        const myTasks = await db.Task.findAll({
            where: {
                system,
                [Op.or]: [
                    { assignee_id: numericId },
                    { assigner_id: numericId },
                    { reviewer_id: numericId },
                    { manager_id: numericId }
                ]
            },
            order: [["createdAt", "DESC"]],
            include: [
                ...["assigner", "assignee", "reviewer", "manager"].map((role) => ({
                    model: db.User,
                    as: role,
                    required: true,
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Employee,
                            as: "employee",
                            required: true,
                            attributes: ["id", "first_name", "middle_name", "last_name"],
                        },
                    ],
                })),
                ...[
                    { model: db.Organization, as: "organization" },
                    { model: db.Program, as: "program" },
                    { model: db.Project, as: "project" },
                    { model: db.Authority, as: "authority" },
                ].map(({ model, as }) => ({
                    model,
                    as,
                    required: true,
                    attributes: ["id", "name"],
                })),
                {
                    model: db.TaskDetail,
                    as: "details",
                    attributes: ["id", "order", "title", "description", "note", "status", "end_date"],
                },
            ]
        });
        const myAssigneeTasks = myTasks.filter(task => task.assignee_id === numericId);
        const groupedAssigneeTasks = groupTasksByMonth(myAssigneeTasks, monthsArabic);
        res.status(200).json({
            status: "success",
            message: "my tasks got fetched successfully",
            myTasks: {
                myAssigneeTasks: groupedAssigneeTasks,
                myAssignerTasks: groupedAssignerTasks,
                myReviewerTasks: groupedReviewerTasks,
                myManagerTasks: groupedManagerTasks
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.tmsDashboardold = async (req, res) => {
    try {
        const { system } = req.params;

        const allTasks = await db.Task.findAll({
            where: { system },
            order: [["createdAt", "DESC"]],
            include: [
                ...["assigner", "assignee", "reviewer", "manager"].map((role) => ({
                    model: db.User,
                    as: role,
                    required: true,
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Employee,
                            as: "employee",
                            required: true,
                            attributes: ["id", "first_name", "middle_name", "last_name"],
                        },
                    ],
                })),
                ...[
                    { model: db.Organization, as: "organization" },
                    { model: db.Program, as: "program" },
                    { model: db.Project, as: "project" },
                    { model: db.Authority, as: "authority" },
                ].map(({ model, as }) => ({
                    model,
                    as,
                    required: true,
                    attributes: ["id", "name"],
                })),
                {
                    model: db.TaskDetail,
                    as: "details",
                    attributes: ["id", "order", "title", "description", "note", "status", "end_date"],
                },
            ]
        });
        const groupedTasks = groupTasksByMonth(allTasks, monthsArabic);
        const monthlyTasks = groupedTasks.map(m => {
            const totals = m.tasks.reduce(
                (acc, task) => {
                    acc.manager_quality += task.manager_quality || 0;
                    acc.manager_speed += task.manager_speed || 0;
                    acc.manager_status += task.manager_status || 0;
                    acc.reviewer_quality += task.reviewer_quality || 0;
                    acc.reviewer_speed += task.reviewer_speed || 0;
                    acc.reviewer_status += task.reviewer_status || 0;
                    return acc;
                },
                {
                    manager_quality: 0,
                    manager_speed: 0,
                    manager_status: 0,
                    reviewer_quality: 0,
                    reviewer_speed: 0,
                    reviewer_status: 0,
                }
            );

            const count = m.tasks.length;

            const manager_quality = totals.manager_quality / count;
            const manager_speed = totals.manager_speed / count;
            const manager_status = totals.manager_status / count;

            const reviewer_quality = totals.reviewer_quality / count;
            const reviewer_speed = totals.reviewer_speed / count;
            const reviewer_status = totals.reviewer_status / count;

            const quality_avg = (manager_quality + reviewer_quality) / 2;
            const speed_avg = (manager_speed + reviewer_speed) / 2;
            const status_avg = (manager_status + reviewer_status) / 2;

            const totalScore = (quality_avg + speed_avg + status_avg) / 3;

            return {
                ...m,
                tasksCount: count,
                performance: roundNumber(totalScore),
                manager_quality,
                manager_speed,
                manager_status,
                reviewer_quality,
                reviewer_speed,
                reviewer_status,
            };
        });

        res.status(200).json({
            status: "success",
            message: "dashboard got fetched successfully",
            dashboard: monthlyTasks
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.tmsDashboard = async (req, res) => {
    try {
        const filters = {
            system: req.query.system,
            organization_id: req.query.organization_id,
            employee_id: req.query.employee_id,
            month: req.query.month
        };

        const dashboard = await tmsService.getDashboardData(filters);

        res.status(200).json({
            status: "success",
            message: "dashboard fetched successfully",
            dashboard
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
