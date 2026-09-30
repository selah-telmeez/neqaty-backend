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

// error with an http status, for validation problems inside transactions
class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// adds one point item to a user (users.id) right away and records it in the history
const applyPoint = async ({ adminId, userId, pointId }, transaction) => {
  const admin = await AdminsUsers.findByPk(adminId, { transaction });
  if (!admin) {
    throw new RequestError(400, "Admin user not found");
  }
  const point = await RewardsAndPunishments.findOne({
    where: { id: pointId, type: VTC_POINT_TYPES },
    transaction,
  });
  if (!point) {
    throw new RequestError(400, "Point record not found");
  }

  // users without a points row start from 0
  const [userPoints] = await UsersPoints.findOrCreate({
    where: { user_id: userId },
    defaults: { points: 0 },
    transaction,
  });
  await userPoints.increment({ points: point.points }, { transaction });

  const history = await PointsHistory.create(
    {
      admin_id: adminId,
      user_id: userPoints.id,
      point_id: point.id,
      status: "accepted",
    },
    { transaction }
  );

  return { user: userPoints, history, status: "accepted" };
};

exports.updatePoints = async (req, res) => {
  try {
    const { admin_id, user_id, point } = req.body;

    if (!admin_id || !user_id || point === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await UsersPoints.sequelize.transaction((transaction) =>
      applyPoint({ adminId: admin_id, userId: user_id, pointId: point }, transaction)
    );

    res.status(200).json({
      status: "success",
      message: "Points updated and history recorded successfully.",
      result,
    });
  } catch (error) {
    console.error("Update Points Error:", error);
    res.status(error.status || 500).json({ message: error.status ? error.message : "Server error", error: error.message });
  }
};

// rows: [{ row, username, point }] where point is the item id or its exact name.
// Everything is checked first; nothing is applied if any row is invalid.
exports.bulkAddPoints = async (req, res) => {
  try {
    const { admin_id, rows } = req.body;
    if (!admin_id || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "admin_id and rows are required" });
    }
    if (rows.length > 1000) {
      return res.status(400).json({ message: "A file can contain at most 1000 rows" });
    }

    const codes = [...new Set(rows.map((r) => Number(r.username)).filter(Number.isInteger))];
    const [users, points] = await Promise.all([
      User.findAll({ attributes: ["id", "code"], where: { code: codes, deleted: false } }),
      RewardsAndPunishments.findAll({ attributes: ["id", "name"], where: { type: VTC_POINT_TYPES } }),
    ]);
    const userByCode = new Map(users.map((u) => [u.code, u]));
    const pointById = new Map(points.map((p) => [p.id, p]));
    const pointByName = new Map(points.map((p) => [String(p.name).trim(), p]));

    const errors = [];
    const valid = [];
    for (const row of rows) {
      const user = userByCode.get(Number(row.username));
      const pointValue = String(row.point ?? "").trim();
      const point = pointById.get(Number(pointValue)) || pointByName.get(pointValue);
      if (!user) errors.push({ row: row.row, message: `اسم المستخدم "${row.username ?? ""}" غير موجود` });
      else if (!point) errors.push({ row: row.row, message: `البند "${pointValue}" غير موجود` });
      else valid.push({ userId: user.id, pointId: point.id });
    }
    if (errors.length) {
      return res.status(400).json({ message: "Some rows are invalid", errors });
    }

    await UsersPoints.sequelize.transaction(async (transaction) => {
      for (const item of valid) {
        await applyPoint({ adminId: admin_id, ...item }, transaction);
      }
    });

    res.status(200).json({ status: "success", message: "Points added successfully", applied: valid.length });
  } catch (error) {
    console.error("Bulk Points Error:", error);
    res.status(error.status || 500).json({ message: error.status ? error.message : "Server error", error: error.message });
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

    // users without a points row start from 0; create it on first lookup
    const [userPoints] = await UsersPoints.findOrCreate({
      where: { user_id },
      defaults: { points: 0 },
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

// the last `count` weeks (starting Saturday, Cairo time), oldest first
const CAIRO_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" });
const cairoDay = (date) => new Date(`${CAIRO_DAY.format(date)}T00:00:00Z`); // the Cairo calendar day, as UTC midnight
const DAY_MS = 24 * 60 * 60 * 1000;

const lastWeeks = (count) => {
  const today = cairoDay(new Date());
  const sinceSaturday = (today.getUTCDay() + 1) % 7;
  const thisWeek = new Date(today.getTime() - sinceSaturday * DAY_MS);
  const weeks = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(thisWeek.getTime() - i * 7 * DAY_MS);
    weeks.push({
      start,
      week: `${String(start.getUTCDate()).padStart(2, "0")}/${String(start.getUTCMonth() + 1).padStart(2, "0")}`,
    });
  }
  // one extra day so points near midnight (Cairo vs UTC) are not missed; bucketing below is exact
  return { weeks, since: new Date(weeks[0].start.getTime() - DAY_MS) };
};

// sums accepted points per week; userId (users.id) limits it to one user
const weeklyPerformance = async (userId) => {
  const { weeks, since } = lastWeeks(12);
  const history = await PointsHistory.findAll({
    attributes: ["updatedAt"],
    where: { status: "accepted", updatedAt: { [Op.gte]: since } },
    include: [
      { model: RewardsAndPunishments, as: "point", required: true, attributes: ["points"] },
      {
        model: UsersPoints,
        as: "userPoints",
        required: true,
        attributes: [],
        ...(userId ? { where: { user_id: userId } } : {}),
      },
    ],
  });

  const totals = weeks.map(() => 0);
  for (const item of history) {
    const day = cairoDay(item.updatedAt).getTime();
    const index = weeks.findIndex((w) => day >= w.start.getTime() && day < w.start.getTime() + 7 * DAY_MS);
    if (index >= 0) totals[index] += item.point.points;
  }
  return weeks.map((w, i) => ({
    week: w.week,
    start: w.start.toISOString().slice(0, 10),
    performance: totals[i],
  }));
};

exports.weeklyPerformance = async (req, res) => {
  try {
    res.status(200).json({ status: "success", data: await weeklyPerformance() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.userWeeklyPerformance = async (req, res) => {
  try {
    res.status(200).json({ status: "success", data: await weeklyPerformance(req.params.id) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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

// user_type -> titles in users_role / employees_role and the admins_users role
// super admin: admin page + points, admin: points only, employee: own profile only
const NEW_USER_TYPES = {
  super_admin: { userRole: "super admin", employeeRole: "SUPER ADMIN", adminRole: "super_admin" },
  admin: { userRole: "admin", employeeRole: "ADMIN", adminRole: "admin" },
  employee: { userRole: "Employee", employeeRole: "Employee" },
};

const generatePassword = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");

const parseStartingPoints = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  const points = Number(value);
  return Number.isInteger(points) ? points : null;
};

// locks code generation for the transaction and returns the next free username (code)
const nextUserCode = async (transaction) => {
  await User.sequelize.query("SELECT pg_advisory_xact_lock(hashtext('users_code'))", { transaction });
  const maxCode = await User.max("code", { transaction });
  return (maxCode || 0) + 1;
};

// creates user + employee (+ admin + starting points) inside the given transaction
const createUserRecord = async ({ typeConfig, code, hashedPassword, person, organizationId, jobTitle, startingPoints }, transaction) => {
  const [userRole] = await UserRole.findOrCreate({ where: { title: typeConfig.userRole }, transaction });
  const user = await User.create(
    { code, password: hashedPassword, role_id: userRole.id, upload_id: null },
    { transaction }
  );

  // the job title from the excel file is used as the employee role (shown in the type filter)
  const [employeeRole] = await EmployeeRole.findOrCreate({
    where: { title: jobTitle || typeConfig.employeeRole },
    transaction,
  });
  await Employee.create(
    { ...person, organization_id: organizationId, role_id: employeeRole.id, user_id: user.id },
    { transaction }
  );

  if (typeConfig.adminRole) {
    await AdminsUsers.create({ user_id: user.id, role: typeConfig.adminRole }, { transaction });
  }
  await UsersPoints.create({ user_id: user.id, points: startingPoints }, { transaction });
  return user;
};

const cleanPerson = ({ first_name, middle_name, last_name, email }) => ({
  first_name: String(first_name || "").trim(),
  middle_name: String(middle_name || "").trim(),
  last_name: String(last_name || "").trim(),
  email: String(email || "").trim().toLowerCase(),
});

const fullName = (p) =>
  p ? [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ") : null;

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
    const { user_type, organization_id, starting_points } = req.body;

    const typeConfig = NEW_USER_TYPES[user_type];
    if (!typeConfig) {
      return res.status(400).json({ message: "Invalid user type" });
    }
    const person = cleanPerson(req.body);
    if (!person.first_name || !person.last_name || !organization_id) {
      return res.status(400).json({ message: "First name, last name and organization are required" });
    }
    const startingPoints = parseStartingPoints(starting_points);
    if (startingPoints === null) {
      return res.status(400).json({ message: "Starting points must be a whole number" });
    }

    const organization = await Organization.findByPk(organization_id);
    if (!organization) {
      return res.status(400).json({ message: "Organization not found" });
    }

    const password = generatePassword();
    const hashedPassword = await hashPassword(password);

    const user = await User.sequelize.transaction(async (transaction) => {
      const code = await nextUserCode(transaction);
      return createUserRecord(
        { typeConfig, code, hashedPassword, person, organizationId: organization_id, startingPoints },
        transaction
      );
    });

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      user: {
        id: user.id,
        name: fullName(person),
        user_type,
        organization: organization.name,
        username: user.code,
        password,
        points: startingPoints,
      },
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// users: [{ first_name, middle_name, last_name, job_title, employee_code }], up to 50 per request
exports.bulkCreateUsers = async (req, res) => {
  try {
    const { user_type, organization_id, starting_points, users } = req.body;

    const typeConfig = NEW_USER_TYPES[user_type];
    if (!typeConfig) {
      return res.status(400).json({ message: "Invalid user type" });
    }
    if (!Array.isArray(users) || users.length === 0 || users.length > 50) {
      return res.status(400).json({ message: "Send between 1 and 50 users per request" });
    }
    const startingPoints = parseStartingPoints(starting_points);
    if (startingPoints === null) {
      return res.status(400).json({ message: "Starting points must be a whole number" });
    }
    const organization = await Organization.findByPk(organization_id);
    if (!organization) {
      return res.status(400).json({ message: "Organization not found" });
    }

    const people = users.map((u) => ({ ...u, person: cleanPerson(u) }));
    const missingName = people.findIndex((p) => !p.person.first_name);
    if (missingName >= 0) {
      return res.status(400).json({ message: `User number ${missingName + 1} has no name` });
    }

    // hash before the transaction so the code lock is held briefly
    const credentials = [];
    for (let i = 0; i < people.length; i++) {
      const password = generatePassword();
      credentials.push({ password, hashedPassword: await hashPassword(password) });
    }

    const created = await User.sequelize.transaction(async (transaction) => {
      let code = await nextUserCode(transaction);
      const result = [];
      for (let i = 0; i < people.length; i++) {
        const { person, job_title, employee_code } = people[i];
        const user = await createUserRecord(
          {
            typeConfig,
            code: code++,
            hashedPassword: credentials[i].hashedPassword,
            person,
            organizationId: organization_id,
            jobTitle: String(job_title || "").trim() || null,
            startingPoints,
          },
          transaction
        );
        result.push({
          employee_code: employee_code ?? "",
          name: fullName(person),
          job_title: String(job_title || "").trim(),
          username: user.code,
          password: credentials[i].password,
        });
      }
      return result;
    });

    res.status(201).json({
      status: "success",
      message: "Users created successfully",
      organization: organization.name,
      users: created,
    });
  } catch (error) {
    console.error("Bulk Create Users Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// every employee user, for the bulk points template
exports.usersList = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "code"],
      where: { deleted: false },
      include: [
        {
          model: Employee,
          as: "employee",
          required: true,
          attributes: ["first_name", "middle_name", "last_name"],
          include: [{ model: Organization, as: "organization", required: false, attributes: ["name"] }],
        },
      ],
      order: [["code", "ASC"]],
    });

    res.status(200).json({
      status: "success",
      users: users.map((u) => ({
        id: u.id,
        username: u.code,
        name: fullName(u.employee),
        organization: u.employee.organization?.name || "",
      })),
    });
  } catch (error) {
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

    // users without a points row start from 0; create it on first lookup
    const [userPoints] = await UsersPoints.findOrCreate({
      where: { user_id: user.id },
      defaults: { points: 0 },
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
