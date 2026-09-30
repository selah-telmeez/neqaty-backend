require('dotenv').config({path: `${process.cwd()}/.env`});
//${process.cwd()} is for checking the current directory
// (for not casuing problems when push to server)

// Either DATABASE_URL (hosted databases like Neon) or the separate DB_* variables (local)
const databaseUrl = process.env.DATABASE_URL || null;

// hosted databases require an encrypted connection
const useSsl = process.env.DB_SSL === "true" || /sslmode=require/.test(databaseUrl || "");

const dbConfig = {
  "url": databaseUrl,
  "username": process.env.DB_USERNAME,
  "password": process.env.DB_PASSWORD,
  "database": process.env.DB_NAME,
  "host": process.env.DB_HOST,
  "port": process.env.DB_PORT,
  "dialect": "postgres",
  "dialectOptions": useSsl ? { "ssl": { "rejectUnauthorized": true } } : {}
};

module.exports = {
  "development": dbConfig,
  "test": dbConfig,
  "production": dbConfig
}
