const { User, Employee, Teacher, Organization } = require("../db/models");

exports.viewTeachers = async (req, res) => {
  try {
    const Users = await User.findAll({
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
              required: true,
              attributes: ["id"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.viewSchools = async (req, res) => {
  try {
    const schools = await Organization.findAll({
      attributes: ["id", "name", "authority_id"],
      where: { type: "school" },
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      schools,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
