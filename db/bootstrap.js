const { Client } = require("pg");
const config = require("../config/config.js")[process.env.NODE_ENV || "development"];
const defaultData = require("./defaultData");

// create the database itself when it doesn't exist yet
const ensureDatabaseExists = async () => {
  // a hosted database (DATABASE_URL) is created by the provider
  if (config.url) return;

  const client = new Client({
    user: config.username,
    password: config.password,
    host: config.host,
    port: config.port,
    database: "postgres",
  });
  await client.connect();
  try {
    const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [config.database]);
    if (rowCount === 0) {
      await client.query(`CREATE DATABASE "${config.database.replace(/"/g, '""')}"`);
      console.log(`Database "${config.database}" created.`);
    }
  } finally {
    await client.end();
  }
};

// insert rows keeping their ids, using only the columns the model knows about
const insertRows = async (db, modelName, rows, transaction) => {
  const model = db[modelName];
  const columns = Object.values(model.getAttributes()).map((attr) => attr.field);
  const cleanRows = rows.map((row) =>
    Object.fromEntries(Object.entries(row).filter(([key]) => columns.includes(key)))
  );
  await db.sequelize.getQueryInterface().bulkInsert(model.getTableName(), cleanRows, {
    transaction,
    ignoreDuplicates: true, // rows that already exist are left as they are
  });
};

// move every id sequence past the ids inserted above
const resetSequences = async (db, transaction) => {
  for (const model of Object.values(db.sequelize.models)) {
    if (!model.getAttributes().id?.autoIncrement) continue;
    const table = model.getTableName();
    await db.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`,
      { transaction }
    );
  }
};

const seedDefaultData = async (db) => {
  await db.sequelize.transaction(async (transaction) => {
    await insertRows(db, "Authority", defaultData.authorities, transaction);
    await insertRows(db, "Organization", defaultData.organizations, transaction);
    await insertRows(db, "UserRole", defaultData.userRoles, transaction);
    await insertRows(db, "EmployeeRole", defaultData.employeeRoles, transaction);
    await insertRows(db, "User", defaultData.users, transaction);
    await insertRows(db, "Employee", defaultData.employees, transaction);
    await insertRows(db, "AdminsUsers", defaultData.admins, transaction);
    await resetSequences(db, transaction);

    for (const organization of defaultData.newOrganizations) {
      await db.Organization.create(organization, { transaction });
    }
  });
  console.log("Default data seeded (user 1, its organization, org 1 and org 2).");
};

/**
 * Runs on startup:
 * - creates the database if it's missing (local setup only; hosted databases already exist)
 * - builds the table structure from the models if the database has no tables
 * - seeds the default data if there are no users yet
 */
const bootstrapDatabase = async () => {
  await ensureDatabaseExists();

  const db = require("./models");
  await db.sequelize.authenticate();
  console.log("Database connected successfully.");

  const tables = await db.sequelize.getQueryInterface().showAllTables();
  if (tables.length === 0) {
    await db.sequelize.sync();
    console.log("Database was empty; tables created from the models.");
  }

  if ((await db.User.count()) === 0) {
    await seedDefaultData(db);
  }
};

module.exports = bootstrapDatabase;
