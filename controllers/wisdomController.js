const { User, Employee, Teacher, Organization } = require("../db/models");

exports.getEmployees = async (req, res) => {
    try {
        const employees = await User.findAll({
            attributes: ["id", "code"],
            include: [
                {
                    model: Employee,
                    as: "employee",
                    required: true,
                    attributes: ["id", "first_name", "middle_name", "last_name", "organization_id", "role_id"],
                    include: [
                        {
                            model: Teacher,
                            as: "teacher",
                            required: false,
                            attributes: ["id"],
                        },
                        {
                            model: Organization,
                            as: "organization",
                            where: { type: "school" },
                            required: true,
                            attributes: ["id"],
                        },
                    ],
                },
            ],
        });

        res.status(200).json({
            status: "success",
            message: "employees got fetched successfully",
            employees
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};
