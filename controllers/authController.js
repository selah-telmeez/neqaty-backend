const jwt = require("jsonwebtoken");
const {
  User,
  UserRole,
  Employee,
  EmployeeRole,
  Student,
  AdminsUsers,
} = require("../db/models");
const { comparePassword } = require("../utils/hashPassword");
require("dotenv").config();

// User Login Controller
const login = async (req, res) => {
  try {
    const { code, password } = req.body;
    // check availability of the required data
    if (!code || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check for the user's existence (only the users with deleted column false)
    const user = await User.findOne({
      where: { code, deleted: false },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid code or password" });
    }

    // compare the sended password with the actual password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid code or password" });
    }

    const userRole = await UserRole.findOne({ where: { id: user.role_id } });
    const admin = await AdminsUsers.findOne({ where: { user_id: user.id } });

    // a user is either an employee (teachers included) or a student
    const employee = await Employee.findOne({ where: { user_id: user.id } });
    const student = employee ? null : await Student.findOne({ where: { user_id: user.id } });
    const employeeRole = employee
      ? await EmployeeRole.findOne({ where: { id: employee.role_id } })
      : null;
    const person = employee || student;

    // create token to the user
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // attach the needed data to the response object
    const response = {
      message: "Login successful",
      id: user.id,
      code: user.code,
      name: person
        ? [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(" ")
        : null,
      user_role: userRole?.title || null,
      token,
      organization_id: employee ? employee.organization_id : student ? student.school_id : null,
      admin_id: admin?.id || null,
      admin_role: admin?.role || null,
    };

    if (employee) {
      response.employee_id = employee.id;
      response.employee_role = employeeRole?.title || null;
      response.email = employee.email;
    }
    if (student) response.email = student.email;

    // return the response
    res.status(200).json(response);
  } catch (error) {
    // simple error reponse
    console.error("ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      name: error?.name,
      error: error?.message,
    });
  }
};

module.exports = { login };
