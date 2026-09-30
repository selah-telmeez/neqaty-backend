const {
  RewardsAndPunishments,
  UsersPoints,
  PointsHistory,
  AdminsUsers,
  User,
  Student,
  Employee,
  UserRole,
  EmployeeRole,
  Organization,
  Authority,
  Setting,
} = require("../db/models");
const { fn, col, Op } = require("sequelize");
const crypto = require("crypto");
const { hashPassword } = require("../utils/hashPassword");
const { uploadNeqatyLogo } = require("../middleware/uploadNeqatyLogo");

exports.viewVtcPoints = async (req, res) => {
  try {
    const Points = await RewardsAndPunishments.findAll({
      attributes: ["id", "name", "type", "points"],
      where: {
        type: ["vtc_reward", "vtc_punishment"],
      },
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Points,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.updatePoints = async (req, res) => {
  try {
    const { admin_id, user_id, point } = req.body;

    if (!admin_id || !user_id || point === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await UsersPoints.sequelize.transaction(
      async (transaction) => {
        let user;
        const userPoints = await UsersPoints.findOne({
          where: { user_id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!userPoints) {
          const newUser = await UsersPoints.create(
            {
              points: 100,
              user_id,
            },
            { transaction });
          user = newUser;
        } else {
          user = userPoints;
        }

        const adminRole = await AdminsUsers.findOne({
          where: { id: admin_id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!adminRole) {
          throw new Error("Admin user not found");
        }

        let status;
        if (adminRole.role === "admin" || adminRole.role === "super_admin") {
          status = "pending";
        } else if (adminRole.role === "ceo") {
          const pointDetails = await RewardsAndPunishments.findOne({
            where: { id: point },
            transaction,
          });
          if (!pointDetails) {
            throw new Error("Point record not found");
          }
          status = "accepted";
          await user.increment(
            { points: pointDetails.points },
            { transaction }
          );
        } else {
          throw new Error("Unauthorized admin role");
        }

        const history = await PointsHistory.create(
          {
            admin_id,
            user_id: user.id,
            point_id: point,
            status,
          },
          { transaction }
        );

        return { user, history, status };
      }
    );

    res.status(200).json({
      status: "success",
      message: `Points ${result.status === "accepted" ? "updated" : "pending approval"
        } and history recorded successfully.`,
      result,
    });
  } catch (error) {
    console.error("Update Points Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.viewPointsPermissions = async (req, res) => {
  try {
    const PointsPermissions = await PointsHistory.findAll({
      attributes: ["id", "admin_id", "user_id", "point_id", "status"],
      include: [
        {
          model: AdminsUsers,
          as: "admin",
          required: true,
          attributes: ["id", "role"],
          include: [
            {
              model: User,
              as: "userPoints",
              required: true,
              attributes: ["id"],
              include: [
                {
                  model: Employee,
                  as: "employee",
                  required: false,
                  attributes: ["first_name", "middle_name", "last_name"],
                },
              ],
            },
          ],
        },
        {
          model: UsersPoints,
          as: "userPoints",
          required: true,
          attributes: ["points", "user_id"],
          include: [
            {
              model: User,
              as: "user",
              required: true,
              attributes: ["id"],
              include: [
                {
                  model: Student,
                  as: "student",
                  required: false,
                  attributes: ["first_name", "middle_name", "last_name"],
                },
                {
                  model: Employee,
                  as: "employee",
                  required: false,
                  attributes: ["first_name", "middle_name", "last_name"],
                },
              ],
            },
          ],
        },
        {
          model: RewardsAndPunishments,
          as: "point",
          required: true,
          attributes: ["name", "points", "type"],
        },
      ],
      where: { status: "pending" },
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      PointsPermissions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.PointRequestStatus = async (req, res) => {
  try {
    const { adminId, id, status } = req.body;

    if (!id || !status || !adminId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await PointsHistory.sequelize.transaction(
      async (transaction) => {
        const pointRequest = await PointsHistory.findOne({
          where: { id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!pointRequest) {
          throw new Error("There is no point request with this id");
        }

        if (status === "denied") {
          pointRequest.status = "denied";
          await pointRequest.save({ transaction });

          return {
            message: "Request has been denied.",
            userPoints: null,
          };
        }

        if (status === "accepted") {
          const adminRole = await AdminsUsers.findOne({
            where: { id: adminId },
            transaction,
            lock: transaction.LOCK.UPDATE,
          });

          if (!adminRole) {
            throw new Error("Admin user not found");
          }
          if (adminRole.role === "super_admin") {
            pointRequest.status = "accepted";
            await pointRequest.save({ transaction });

            await PointsHistory.create(
              {
                admin_id: adminId,
                user_id: pointRequest.user_id,
                point_id: pointRequest.point_id,
                status: "pending",
              },
              { transaction }
            );

            return {
              message: "A request has been sent to the CEO.",
            };
          }

          if (adminRole.role === "ceo") {
            pointRequest.status = "accepted";
            await pointRequest.save({ transaction });

            const userPoints = await UsersPoints.findOne({
              where: { id: pointRequest.user_id },
              transaction,
              lock: transaction.LOCK.UPDATE,
            });

            if (!userPoints) {
              throw new Error("This user is not part of the points system");
            }

            const pointDetails = await RewardsAndPunishments.findOne({
              where: { id: pointRequest.point_id },
              transaction,
            });

            if (!pointDetails) {
              throw new Error("Point details not found");
            }

            userPoints.points += pointDetails.points;
            await userPoints.save({ transaction });

            return {
              message: "Points accepted and added to user account.",
              userPoints: userPoints.points,
            };
          }

          throw new Error("Unauthorized admin role");
        }
      }
    );

    res.status(200).json({
      status: "success",
      message: result.message,
      ...(result.userPoints !== undefined && { userPoints: result.userPoints }),
    });
  } catch (error) {
    console.error("Update Points Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.viewUserPoints = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const user = await User.findByPk(user_id, { attributes: ["id"] });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // every user starts with 100 points, so create the row on first lookup
    const [userPoints] = await UsersPoints.findOrCreate({
      where: { user_id },
      defaults: { points: 100 },
    });
    const Points = { points: userPoints.points };

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Points,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// the last `count` months ending with the current one, oldest first
const lastMonths = (count) => {
  const now = new Date();
  const monthsArray = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    monthsArray.push({
      monthNumber: date.getMonth() + 1,
      year: date.getFullYear(),
      month: date.toLocaleString("ar", { month: "long" }),
    });
  }
  const startDate = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
  return { monthsArray, startDate };
};

exports.watomsMonthlyPerformance = async (req, res) => {
  try {
    const { monthsArray, startDate } = lastMonths(12);

    const results = await PointsHistory.findAll({
      attributes: [
        [fn("DATE_PART", "year", col("PointsHistory.updatedAt")), "year"],
        [fn("DATE_PART", "month", col("PointsHistory.updatedAt")), "monthNumber"],
        [fn("SUM", col("point.points")), "totalPoints"],
      ],
      include: [
        {
          model: UsersPoints,
          as: "userPoints",
          required: true,   // force inner join
          attributes: [],
          include: [
            {
              model: User,
              as: "user",
              required: true, // force inner join
              attributes: [],
              include: [
                {
                  model: Employee,
                  as: "employee",
                  required: true, // force inner join
                  attributes: [],
                },
              ],
            },
          ],
        },
        {
          model: RewardsAndPunishments,
          as: "point",
          required: true, // force inner join
          attributes: [],
        },
      ],
      where: { status: "accepted", updatedAt: { [Op.gte]: startDate } },
      group: [
        fn("DATE_PART", "year", col("PointsHistory.updatedAt")),
        fn("DATE_PART", "month", col("PointsHistory.updatedAt")),
      ],
      raw: true,
    });

    const months = monthsArray.map((m) => {
      const found = results.find(
        (r) => Number(r.monthNumber) === m.monthNumber && Number(r.year) === m.year
      );
      return {
        monthNumber: m.monthNumber,
        year: m.year,
        month: m.month,
        performance: found ? Number(found.totalPoints) : 0,
      };
    });

    res.status(200).json({
      status: "success",
      message: "Aggregated performance per month",
      data: months,
    });
  } catch (error) {
    console.error("Error in monthlyPerformance:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.employeeMonthlyPerformance = async (req, res) => {
  try {
    const { id } = req.params;

    const { monthsArray, startDate } = lastMonths(12);

    const employeePoints = await PointsHistory.findAll({
      include: [
        {
          model: UsersPoints,
          as: "userPoints",
          required: true,
          attributes: [],
          include: [
            {
              model: User,
              as: "user",
              required: true,
              attributes: [],
              include: [
                {
                  model: Employee,
                  as: "employee",
                  required: true,
                  attributes: [],
                  where: { user_id: id },
                },
              ],
            },
          ],
        },
        {
          model: RewardsAndPunishments,
          as: "point",
          required: true, // force inner join
          attributes: ['name', 'points', 'type'],
        },
      ],
      where: { status: "accepted", updatedAt: { [Op.gte]: startDate } },
      order: [["updatedAt", "ASC"]],
      raw: true,
    })

    const results = await PointsHistory.findAll({
      attributes: [
        [fn("DATE_PART", "year", col("PointsHistory.updatedAt")), "year"],
        [fn("DATE_PART", "month", col("PointsHistory.updatedAt")), "monthNumber"],
        [fn("SUM", col("point.points")), "totalPoints"],
      ],
      include: [
        {
          model: UsersPoints,
          as: "userPoints",
          required: true,
          attributes: [],
          include: [
            {
              model: User,
              as: "user",
              required: true,
              attributes: [],
              include: [
                {
                  model: Employee,
                  as: "employee",
                  required: true,
                  attributes: [],
                  where: { user_id: id },
                },
              ],
            },
          ],
        },
        {
          model: RewardsAndPunishments,
          as: "point",
          required: true, // force inner join
          attributes: [],
        },
      ],
      where: { status: "accepted", updatedAt: { [Op.gte]: startDate } },
      group: [
        fn("DATE_PART", "year", col("PointsHistory.updatedAt")),
        fn("DATE_PART", "month", col("PointsHistory.updatedAt")),
      ],
      raw: true,
    });

    const months = monthsArray.map((m) => {
      const found = results.find(
        (r) => Number(r.monthNumber) === m.monthNumber && Number(r.year) === m.year
      );
      return {
        monthNumber: m.monthNumber,
        year: m.year,
        month: m.month,
        performance: found ? Number(found.totalPoints) : 0,
      };
    });

    res.status(200).json({
      status: "success",
      message: "Aggregated performance across selected orgs per month",
      data: {
        employeePoints,
        months
      },
    });
  } catch (error) {
    console.error("Error in monthlyPerformance:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const VTC_POINT_TYPES = ["vtc_reward", "vtc_punishment"];

const validateVtcPoint = ({ name, type, points }) => {
  if (!name || !String(name).trim()) return "Name is required";
  if (!VTC_POINT_TYPES.includes(type)) return "Invalid point type";
  if (points === undefined || points === "" || !Number.isInteger(Number(points))) {
    return "Points must be an integer";
  }
  return null;
};

exports.createVtcPoint = async (req, res) => {
  try {
    const { name, type, points } = req.body;
    const validationError = validateVtcPoint({ name, type, points });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const Point = await RewardsAndPunishments.create({
      name: String(name).trim(),
      type,
      points: Number(points),
    });

    res.status(201).json({
      status: "success",
      message: "Point created successfully",
      Point,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateVtcPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, points } = req.body;
    const validationError = validateVtcPoint({ name, type, points });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const Point = await RewardsAndPunishments.findOne({
      where: { id, type: VTC_POINT_TYPES },
    });
    if (!Point) {
      return res.status(404).json({ message: "Point not found" });
    }

    await Point.update({
      name: String(name).trim(),
      type,
      points: Number(points),
    });

    res.status(200).json({
      status: "success",
      message: "Point updated successfully",
      Point,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteVtcPoint = async (req, res) => {
  try {
    const { id } = req.params;

    const Point = await RewardsAndPunishments.findOne({
      where: { id, type: VTC_POINT_TYPES },
    });
    if (!Point) {
      return res.status(404).json({ message: "Point not found" });
    }

    // points_history.point_id is NOT NULL, so a point already used in history can't be removed
    const usedCount = await PointsHistory.count({ where: { point_id: id } });
    if (usedCount > 0) {
      return res.status(409).json({
        message: "Point is already used in points history and can't be deleted",
      });
    }

    await Point.destroy();

    res.status(200).json({
      status: "success",
      message: "Point deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// user_type -> titles in users_role / employees_role (and admins_users role for admins)
const NEW_USER_TYPES = {
  admin: { userRole: "admin", employeeRole: "ADMIN", adminRole: "admin" },
  employee: { userRole: "Employee", employeeRole: "Employee" },
};

exports.signupOptions = async (req, res) => {
  try {
    const [organizations, authorities] = await Promise.all([
      Organization.findAll({
        attributes: ["id", "name", "city", "type", "authority_id"],
        where: { deleted: false },
        order: [["name", "ASC"]],
      }),
      Authority.findAll({ attributes: ["id", "name"], order: [["id", "ASC"]] }),
    ]);

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      organizations,
      authorities,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      user_type,
      first_name,
      middle_name,
      last_name,
      email,
      organization_id,
    } = req.body;

    const typeConfig = NEW_USER_TYPES[user_type];
    if (!typeConfig) {
      return res.status(400).json({ message: "Invalid user type" });
    }
    if (!first_name?.trim() || !last_name?.trim() || !organization_id) {
      return res.status(400).json({ message: "First name, last name and organization are required" });
    }

    const organization = await Organization.findByPk(organization_id);
    if (!organization) {
      return res.status(400).json({ message: "Organization not found" });
    }

    const password = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    const hashedPassword = await hashPassword(password);
    const names = {
      first_name: first_name.trim(),
      middle_name: middle_name?.trim() || "",
      last_name: last_name.trim(),
      email: email?.trim().toLowerCase() || "",
    };

    const user = await User.sequelize.transaction(async (transaction) => {
      // serialize code generation so two signups can't get the same code
      await User.sequelize.query("SELECT pg_advisory_xact_lock(hashtext('users_code'))", { transaction });
      const maxCode = await User.max("code", { transaction });
      const code = (maxCode || 0) + 1;

      const [userRole] = await UserRole.findOrCreate({
        where: { title: typeConfig.userRole },
        transaction,
      });

      const user = await User.create(
        { code, password: hashedPassword, role_id: userRole.id, upload_id: null },
        { transaction }
      );

      const [employeeRole] = await EmployeeRole.findOrCreate({
        where: { title: typeConfig.employeeRole },
        transaction,
      });

      await Employee.create(
        { ...names, organization_id, role_id: employeeRole.id, user_id: user.id },
        { transaction }
      );

      if (typeConfig.adminRole) {
        await AdminsUsers.create(
          { user_id: user.id, role: typeConfig.adminRole },
          { transaction }
        );
      }

      return user;
    });

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      user: {
        id: user.id,
        name: `${names.first_name} ${names.middle_name} ${names.last_name}`.replace(/\s+/g, " ").trim(),
        user_type,
        organization: organization.name,
        username: user.code,
        password,
      },
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// new organizations are schools so they show up in the authority / vtc filters
exports.createOrganization = async (req, res) => {
  try {
    const { name, city, authority_id } = req.body;

    if (!name?.trim() || !authority_id) {
      return res.status(400).json({ message: "Name and authority are required" });
    }

    const authority = await Authority.findByPk(authority_id);
    if (!authority) {
      return res.status(400).json({ message: "Authority not found" });
    }

    const exists = await Organization.findOne({
      where: { name: { [Op.iLike]: name.trim() } },
    });
    if (exists) {
      return res.status(409).json({ message: "An organization with this name already exists" });
    }

    const organization = await Organization.create({
      name: name.trim(),
      city: city?.trim() || "",
      type: "school",
      authority_id,
    });

    res.status(201).json({
      status: "success",
      message: "Organization created successfully",
      organization: {
        id: organization.id,
        name: organization.name,
        city: organization.city,
        type: organization.type,
        authority_id: organization.authority_id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.userProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ["id", "code"],
      include: [
        { model: UserRole, as: "role", attributes: ["title"] },
        {
          model: Employee,
          as: "employee",
          required: false,
          attributes: ["first_name", "middle_name", "last_name", "email", "organization_id"],
          include: [{ model: EmployeeRole, as: "role", attributes: ["title"] }],
        },
        {
          model: Student,
          as: "student",
          required: false,
          attributes: ["first_name", "middle_name", "last_name", "email", "school_id"],
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const person = user.employee || user.student;
    const organizationId = user.employee?.organization_id || user.student?.school_id;
    const organization = organizationId
      ? await Organization.findByPk(organizationId, { attributes: ["name"] })
      : null;

    // every user starts with 100 points, so create the row on first lookup
    const [userPoints] = await UsersPoints.findOrCreate({
      where: { user_id: user.id },
      defaults: { points: 100 },
    });

    const history = await PointsHistory.findAll({
      attributes: ["id", "status", "createdAt", "updatedAt"],
      where: { user_id: userPoints.id },
      include: [
        {
          model: RewardsAndPunishments,
          as: "point",
          required: false,
          attributes: ["name", "points", "type"],
        },
        {
          model: AdminsUsers,
          as: "admin",
          required: false,
          attributes: ["id"],
          include: [
            {
              model: User,
              as: "userPoints",
              required: false,
              attributes: ["id"],
              include: [
                {
                  model: Employee,
                  as: "employee",
                  required: false,
                  attributes: ["first_name", "middle_name", "last_name"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const fullName = (p) =>
      p ? [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ") : null;

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      profile: {
        id: user.id,
        code: user.code,
        name: fullName(person),
        email: person?.email || null,
        role: user.employee?.role?.title || user.role?.title || null,
        organization: organization?.name || null,
        points: userPoints.points,
      },
      history: history.map((item) => ({
        id: item.id,
        status: item.status,
        date: item.updatedAt,
        name: item.point?.name || null,
        points: item.point?.points ?? null,
        type: item.point?.type || null,
        given_by: fullName(item.admin?.userPoints?.employee),
      })),
    });
  } catch (error) {
    console.error("User Profile Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// the navbar logo is stored in the settings table as JSON { mimetype, data (base64) };
// no row means the default logo
const LOGO_KEY = "neqaty_logo";

// url of the image endpoint; the version changes on every upload so browsers don't show an old logo
const logoUrl = (setting) =>
  setting ? `/api/v1/neqaty/logo/image?v=${new Date(setting.updatedAt).getTime()}` : null;

exports.getLogo = async (req, res) => {
  try {
    const setting = await Setting.findByPk(LOGO_KEY, { attributes: ["key", "updatedAt"] });
    res.status(200).json({ status: "success", logo: logoUrl(setting) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getLogoImage = async (req, res) => {
  try {
    const setting = await Setting.findByPk(LOGO_KEY);
    if (!setting) {
      return res.status(404).json({ message: "No custom logo" });
    }
    const { mimetype, data } = JSON.parse(setting.value);
    res.set("Content-Type", mimetype);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(Buffer.from(data, "base64"));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.uploadLogo = (req, res) => {
  uploadNeqatyLogo(req, res, async (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 2MB or smaller" : err.message;
      return res.status(400).json({ message });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Logo image is required" });
    }
    try {
      const value = JSON.stringify({
        mimetype: req.file.mimetype,
        data: req.file.buffer.toString("base64"),
      });
      await Setting.upsert({ key: LOGO_KEY, value });
      const setting = await Setting.findByPk(LOGO_KEY, { attributes: ["key", "updatedAt"] });

      res.status(200).json({
        status: "success",
        message: "Logo updated successfully",
        logo: logoUrl(setting),
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
};

exports.resetLogo = async (req, res) => {
  try {
    await Setting.destroy({ where: { key: LOGO_KEY } });
    res.status(200).json({ status: "success", message: "Logo reset to default", logo: null });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
