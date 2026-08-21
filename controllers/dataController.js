const { Specialization, Authority, Organization, TraineeRegistrationData, Curriculum, EmployeeRole, Project, Program, WebsitePage, UserRole, Employee } = require("../db/models");
require("dotenv").config();
const wabysService = require('../services/wabysService');

exports.fetchAuthorities = async (req, res) => {
    try {
        const authorities = await wabysService.getAuthoritiesData();

        res.status(200).json({
            status: "success",
            message: "authorities got fetched successfully",
            authorities,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.specializations = async (req, res) => {
    try {
        const Specializations = await Specialization.findAll({
            attributes: ["id", "name", "createdAt"],
        });
        res.status(200).json({
            status: "success",
            message: "Specializations got fetched successfully",
            Specializations,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.authorities = async (req, res) => {
    try {
        const Authorities = await Authority.findAll({
            attributes: ["id", "name"],
            order: [["id", "ASC"]],
        });
        res.status(200).json({
            status: "success",
            message: "Authorities got fetched successfully",
            Authorities,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.projects = async (req, res) => {
    try {
        const projects = await Organization.findAll({
            attributes: ["id", "name", "authority_id"],
            order: [["id", "ASC"]],
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            projects,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchTraineesRegistrations = async (req, res) => {
    try {
        const registrations = await TraineeRegistrationData.findAll({
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Organization,
                    as: "org",
                    attributes: ["name"], // only fetch the 'name' column
                },
                {
                    model: Curriculum,
                    as: "curriculum",
                    attributes: ["code"], // only fetch the 'code' column
                },
            ],
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            registrations,
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

exports.fetchProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            attributes: ['id', 'name', 'authority_id']
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            projects,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchPrograms = async (req, res) => {
    try {
        const programs = await Program.findAll({
            attributes: ['id', 'name', 'project_id']
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            programs,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchOrgs = async (req, res) => {
    try {
        const orgs = await Organization.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: Program,
                    as: 'programs',
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
            ],
            order: [['id', 'ASC']],
        });

        res.status(200).json({
            status: 'success',
            message: 'Data fetched successfully',
            orgs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.fetchEducationCenters = async (req, res) => {
    try {
        const { system } = req.params;
        const educationCenters = await Organization.findAll({
            attributes: ["id", "name"],
            where: { type: "school", authority_id: system },
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            educationCenters,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchPagesInfo = async (req, res) => {
    try {
        const pages = await WebsitePage.findAll();

        res.status(200).json({
            status: "success",
            message: "pages got fetched successfully",
            pages,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchEmployeeDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findOne({ where: { id } });

        res.status(200).json({
            status: "success",
            message: "employee got fetched successfully",
            employee,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const EMPLOYEE_DETAILS_EDITABLE_FIELDS = [
    "first_name",
    "middle_name",
    "last_name",
    "birth_date",
    "address",
    "qualification",
    "email",
    "id_number",
    "birth_place",
    "sex",
    "religion",
    "phone_number",
    "financial_job_level",
    "qualitative_group",
    "appointment_date",
    "date_of_receipt_of_current_work",
    "contract_type",
];

exports.updateEmployeeDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findOne({ where: { id } });

        if (!employee) {
            return res.status(404).json({
                status: "fail",
                message: "Employee not found",
            });
        }

        const updateData = {};
        EMPLOYEE_DETAILS_EDITABLE_FIELDS.forEach((field) => {
            if (field in req.body) {
                updateData[field] = req.body[field] === "" ? null : req.body[field];
            }
        });

        await employee.update(updateData);

        res.status(200).json({
            status: "success",
            message: "employee updated successfully",
            employee,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};