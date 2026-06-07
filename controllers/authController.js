const validator = require("validator");
const jwt = require("jsonwebtoken");
const {
  User,
  Employee,
  Teacher,
  UserRole,
  Organization,
  Student,
  EmployeeRole,
  Department,
  AdminsUsers,
  Class,
  Specialization,
  SubjectSpecialization,
  Subject,
  SubjectFormCategory,
  Session,
  System,
  PeCandidate,
  Parent
} = require("../db/models");
const { comparePassword, hashPassword } = require("../utils/hashPassword");
require("dotenv").config();

const ebdaEdulogin = async (req, res) => {
  try {
    const { code, password } = req.body;
    if (!code || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ where: { code } });
    const employee = await Employee.findOne({ where: { user_id: user.id } });
    if (!employee || employee.organization_id !== 3) {
      return res.status(401).json({ message: "Invalid code or password" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid code or password" });
    }

    const userRole = await UserRole.findOne({ where: { id: user.role_id } });

    let organization = null;
    let department = null; // Declare organization outside the if block
    let employeeRole = null;

    if (employee) {
      organization = await Organization.findOne({
        where: { id: employee.organization_id },
      });
    }
    employeeRole = await EmployeeRole.findOne({
      where: { id: employee.role_id },
    });
    if (employeeRole && (employeeRole.title === "Teacher" || employeeRole.title === "HOD")) {
      const teacher = await Teacher.findOne({
        where: { employee_id: employee.id },
      });
      department = await Department.findOne({
        where: { id: teacher.department_id },
      });
    }


    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid code or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      id: user.id,
      code: user.code,
      name: `${employee.first_name} ${employee.middle_name} ${employee.last_name}`,
      organization_id: organization ? organization.id : null,
      department_id: department ? department.id : null,
      user_role: userRole.title,
      employee_id: employee.id,
      employee_role: employeeRole.title,
      email: employee.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// User Login Controller
const login = async (req, res) => {
  try {
    const { code, password } = req.body;
    // check availability of the required data
    if (!code || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check for the user's existence (only the users with deleted column false)
    const user = await User.findOne({ where: { code, deleted: false } });
    if (!user) {
      return res.status(401).json({ message: "Invalid code or password" });
    }

    // find the user's role
    const userRole = await UserRole.findOne({ where: { id: user.role_id } });

    // required variables
    let organization = null;
    let department = null;
    let employeeRole = null;
    let employee = null;
    let student = null;
    let teacher = null;
    let candidate = null;
    let parent = null;

    // check if the user's role is not a student
    if (userRole.title !== "Student" && userRole.title !== "PE Candidate" && userRole.title !== "Parent") {
      // check if the user is listed in employees' table
      employee = await Employee.findOne({ where: { user_id: user.id } });
      if (employee) {
        // get the related organization
        organization = await Organization.findOne({
          where: { id: employee.organization_id },
          include: [
            {
              model: System,
              as: "systems",
              through: { attributes: [] },
            },
          ],
        });
      };
      // find the employee's role
      employeeRole = await EmployeeRole.findOne({
        where: { id: employee.role_id },
      });
      // check if the employee is a teacher or a head of department
      if (employeeRole && (employeeRole.title === "Teacher" || employeeRole.title === "HOD")) {
        // check if the emplyee is listed in teachers table
        teacher = await Teacher.findOne({
          include: [
            {
              model: Subject,
              as: "subjects",
              required: false,
              attributes: ["id", "name"],
              through: { attributes: [] },
              include: {
                model: SubjectFormCategory,
                as: "category",
                required: false,
                attributes: ["id", "name"],
              },
            },
            {
              model: Session,
              as: "sessions",
              required: false,
              attributes: ["id"],
              include: {
                model: Class,
                as: "class",
                required: false,
                attributes: ["id", "name"],
              },
            }
          ],
          where: { employee_id: employee.id },
        });
        // find the teacher's department
        department = await Department.findOne({
          where: { id: teacher.department_id },
        });
      }
      // if the user is a student
    } else if (userRole.title === "PE Candidate") {
      // check if the user is listed in pe candidate' table
      candidate = await PeCandidate.findOne({ where: { user_id: user.id } });
      if (candidate) {
        // get the related organization
        organization = await Organization.findOne({
          where: { id: candidate.organization_id },
        });
      };
      // if the user is a student
    } else if (userRole.title === "Parent") {
      parent = await Parent.findOne({
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              { model: Class, as: 'class', attributes: ['id', 'name'] },
              { model: Specialization, as: 'specialization', attributes: ['id', 'name'] },
              {
                model: Organization,
                as: 'school',
                attributes: ['id', 'name', 'city', 'location'],
              },
            ],
          },
        ],
        where: { user_id: user.id }
      });
      // if the user is a student
    } else {
      // check if the user is in students table
      student = await Student.findOne({
        include: {
          model: Specialization,
          as: "specialization",
          required: true,
          attributes: ["id", "name"],
          include: {
            model: SubjectSpecialization,
            as: "subject",
            required: true,
            attributes: ["id"],
            include: {
              model: Subject,
              as: "subject",
              required: false,
              attributes: ["id", "name"],
              include: {
                model: SubjectFormCategory,
                as: "category",
                required: false,
                attributes: ["id", "name"],
              },
            },

          },
        },
        where: { user_id: user.id }
      });
      if (student) {
        // get the related organization
        organization = await Organization.findOne({
          where: { id: student.school_id },
          include: [
            {
              model: System,
              as: "systems",
              through: { attributes: [] },
            },
          ],
        });
      }
    }

    // compare the sended password with the actual password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid code or password" });
    }

    // create token to the user
    const token = jwt.sign(
      {
        id: user.id,
        student: parent ? parent.student : null,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // attach the needed data to the response object
    const response = {
      message: "Login successful",
      id: user.id,
      code: user.code,
      name: employee
        ? `${employee.first_name} ${employee.middle_name} ${employee.last_name}` :
        candidate ? `${candidate.name}` : parent ? null :
          `${student.first_name} ${student.middle_name} ${student.last_name}`,
      user_role: userRole.title,
      token,
      organization_id: parent ? null : organization.id,
      systems: userRole.id === 33 ? [{ name: "PE" }] : userRole.id === 39 ? [{ name: "Parent" }] : organization.systems,
    };

    // based on the type of the user attach the related data to the response object
    if (department) response.department_id = department.id;
    if (student) response.student_specialization = student.specialization;
    if (teacher) response.teacher_subject = teacher.subjects;
    if (teacher) response.teacher_class = teacher.sessions;
    if (employee) {
      response.employee_id = employee.id;
      response.employee_role = employeeRole?.title || null;
      response.email = employee.email;
    }
    if (student) response.email = student.email;
    if (parent) response.student = {
      id: parent.student.id,
      name: `${parent.student.first_name} ${parent.student.middle_name} ${parent.student.last_name}`.trim(),
      class: parent.student.class,
      specialization: parent.student.specialization,
      school: parent.student.school_id
    }

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

const signup = async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      user_role_id,
      organization_id,
      emp_role_id,
      password,
      planned_sessions,
      subject_ids,
      department_id,
      class_id,
      specialization_id,
    } = req.body;

    // Normalize and validate email
    const normalizedEmail = email?.toLowerCase().trim();
    if (
      !first_name ||
      !last_name ||
      !normalizedEmail ||
      !user_role_id ||
      !organization_id ||
      !password
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const Role = await UserRole.findOne({
      attributes: ["title"],
      where: { id: user_role_id },
    });

    if (!Role) {
      return res.status(400).json({ message: "Invalid user role ID" });
    }

    const hashedPassword = await hashPassword(password);

    const result = await User.sequelize.transaction(async (transaction) => {
      const lastUser = await User.findOne({
        attributes: ["code"],
        order: [["code", "DESC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const newCode = lastUser?.code ? lastUser.code + 1 : 1000;

      const user = await User.create(
        {
          code: newCode,
          password: hashedPassword,
          role_id: user_role_id,
        },
        { transaction }
      );

      if (Role.title === "Student") {
        if (!class_id || !specialization_id) {
          throw new Error("Missing class or specialization");
        }

        const student = await Student.create(
          {
            first_name,
            middle_name,
            last_name,
            email: normalizedEmail,
            user_id: user.id,
            class_id,
            specialization_id,
            school_id: organization_id,
          },
          { transaction }
        );

        return { user, student };
      } else {
        if (!emp_role_id) {
          throw new Error("Missing employee role ID");
        }

        const employee = await Employee.create(
          {
            first_name,
            middle_name,
            last_name,
            email: normalizedEmail,
            organization_id,
            role_id: emp_role_id,
            user_id: user.id,
          },
          { transaction }
        );

        let teacher = null;
        let subjects = null;
        if (
          Role.title === "Teacher" ||
          Role.title === "Head of Department (HOD)"
        ) {
          if (!planned_sessions || subject_ids.length > 0 || !department_id) {
            throw new Error("Missing teacher details");
          }
          teacher = await Teacher.create(
            {
              planned_sessions,
              employee_id: employee.id,
              department_id,
            },
            { transaction }
          );
          subjects = await teacher.addSubjects(subject_ids, { transaction });
        }

        return { user, employee, teacher: teacher || null, subjects: subjects || null };
      }
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ id: result.user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User created successfully",
      code: result.user.code,
      token,
      result,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const {
      user_id,
      new_password
    } = req.body;

    if (
      !user_id ||
      !new_password
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedPassword = await hashPassword(new_password);

    const updatePassword = await User.update(
      { password: hashedPassword },
      {
        where: { id: user_id }
      }
    );

    res.status(201).json({
      message: "User password updated successfully",
      updatePassword
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const signupBulk = async (req, res) => {
  try {
    const users = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Users array is required" });
    }

    const createdResults = [];

    await User.sequelize.transaction(async (transaction) => {
      const lastUser = await User.findOne({
        attributes: ["code"],
        order: [["code", "DESC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      let newCode = lastUser?.code ? lastUser.code + 1 : 1000;

      for (const userData of users) {
        const {
          first_name,
          middle_name,
          last_name,
          email,
          user_role_id,
          organization_id,
          emp_role_id,
          password,
          planned_sessions,
          subject_id,
          department_id,
          class_id,
          specialization_id,
        } = userData;

        const normalizedEmail = email?.toLowerCase().trim();

        if (
          !first_name ||
          !last_name ||
          !normalizedEmail ||
          !user_role_id ||
          !organization_id ||
          !password
        ) {
          throw new Error(`Missing required fields for email: ${email}`);
        }

        if (!validator.isEmail(normalizedEmail)) {
          throw new Error(`Invalid email format: ${email}`);
        }

        const Role = await UserRole.findOne({
          attributes: ["title"],
          where: { id: user_role_id },
          transaction,
        });

        if (!Role) {
          throw new Error(`Invalid user role ID for email: ${email}`);
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create(
          {
            code: newCode++,
            password: hashedPassword,
            role_id: user_role_id,
          },
          { transaction }
        );

        // Get organization name
        const organization = await Organization.findByPk(organization_id, {
          attributes: ['name'],
          transaction,
        });

        let outputData = {
          first_name,
          middle_name,
          last_name,
          email: normalizedEmail,
          code: user.code,
          password,
          organization: organization?.name || null,
          class: null,
          specialization: null,
        };

        if (Role.title === "Student") {
          if (!class_id || !specialization_id) {
            throw new Error(`Missing class/specialization for student: ${email}`);
          }

          await Student.create(
            {
              first_name,
              middle_name,
              last_name,
              email: normalizedEmail,
              user_id: user.id,
              class_id,
              specialization_id,
              school_id: organization_id,
            },
            { transaction }
          );

          // Get class and specialization names
          const classObj = await Class.findByPk(class_id, {
            attributes: ['name'],
            transaction,
          });

          const specialization = await Specialization.findByPk(specialization_id, {
            attributes: ['name'],
            transaction,
          });

          outputData.class = classObj?.name || null;
          outputData.specialization = specialization?.name || null;
        } else {
          if (!emp_role_id) {
            throw new Error(`Missing employee role ID for: ${email}`);
          }

          const employee = await Employee.create(
            {
              first_name,
              middle_name,
              last_name,
              email: normalizedEmail,
              organization_id,
              role_id: emp_role_id,
              user_id: user.id,
            },
            { transaction }
          );

          if (
            Role.title === "Teacher" ||
            Role.title === "Head of Department (HOD)"
          ) {
            if (!planned_sessions || !subject_id || !department_id) {
              throw new Error(`Missing teacher details for: ${email}`);
            }

            await Teacher.create(
              {
                planned_sessions,
                employee_id: employee.id,
                subject_id,
                department_id,
              },
              { transaction }
            );
          }
        }

        createdResults.push(outputData);
      }
    });

    res.status(201).json({
      message: "Users created successfully",
      created: createdResults.length,
      users: createdResults,
    });
  } catch (error) {
    console.error("Bulk Signup Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const adminSignup = async (req, res) => {
  try {
    const {
      username,
      password,
      user_id,
      role
    } = req.body;

    if (
      !username ||
      !user_id ||
      !role ||
      !password
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userCheck = await User.findOne({
      where: { id: user_id },
    });

    if (!userCheck) {
      return res.status(400).json({ message: "Invalid User Id" });
    }

    const hashedPassword = await hashPassword(password);

    const existingAdmin = await AdminsUsers.findOne({ where: { username } });
    if (existingAdmin) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const adminUser = await AdminsUsers.create(
      {
        username,
        password: hashedPassword,
        user_id,
        role
      }
    );

    if (!process.env.JWT_SECRET_POINTS) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ id: adminUser.id }, process.env.JWT_SECRET_POINTS, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Admin created successfully",
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      token,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const Admin = await AdminsUsers.findOne({ where: { username } });
    if (!Admin) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const user = await User.findOne({ where: { id: Admin.user_id } });
    if (!user || user.role_id === 19) {
      return res.status(401).json({ message: "invalid user_id" });
    }
    const employee = await Employee.findOne({ where: { user_id: Admin.user_id } });

    const isMatch = await comparePassword(password, Admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: Admin.id }, process.env.JWT_SECRET_POINTS, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      id: Admin.id,
      username: Admin.username,
      user_role: Admin.role,
      user_organization: employee.organization_id,
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    console.error(error.stack);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { signup, ebdaEdulogin, login, changeUserPassword, adminSignup, adminLogin, signupBulk };