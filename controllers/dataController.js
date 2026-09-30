const { Authority, EmployeeRole } = require("../db/models");

exports.fetchAuthorities = async (req, res) => {
    try {
        const authorities = await Authority.findAll({
            attributes: ["id", "name"],
            order: [["id", "ASC"]],
        });

        res.status(200).json({
            status: "success",
            message: "authorities got fetched successfully",
            authorities,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchEmployeesRoles = async (req, res) => {
    try {
        const roles = await EmployeeRole.findAll({
            attributes: ['id', 'title']
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            roles,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
