const db = require('../db/models');

exports.fetchTasksForDashboard = async (filters) => {
    const where = {};

    if (filters.system) where.system = filters.system;
    if (filters.organization_id) where.organization_id = filters.organization_id;
    if (filters.employee_id) where.assignee_id = filters.employee_id;

    return await db.Task.findAll({
        where,
        order: [["createdAt", "DESC"]],
        include: [
            ...["assigner", "assignee", "reviewer", "manager"].map(role => ({
                model: db.User,
                as: role,
                attributes: ["id"],
                include: [{
                    model: db.Employee,
                    as: "employee",
                    attributes: ["id", "first_name", "middle_name", "last_name"]
                }]
            })),
            { model: db.Organization, as: "organization", attributes: ["id", "name"] },
            {
                model: db.TaskDetail,
                as: "details",
                attributes: ["id", "order", "title", "description", "note", "status", "end_date"]
            }
        ]
    });
};