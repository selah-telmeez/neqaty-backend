const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../../config/config.js')[process.env.NODE_ENV || 'development'];

// Initialize Sequelize (from DATABASE_URL when set, otherwise from the DB_* variables)
const options = {
  dialect: config.dialect,
  // explicit so serverless bundlers (Vercel) include the pg driver
  dialectModule: require('pg'),
  dialectOptions: config.dialectOptions,
  logging: false,
};
const sequelize = config.url
  ? new Sequelize(config.url, options)
  : new Sequelize(config.database, config.username, config.password, {
    ...options,
    host: config.host,
    port: config.port,
  });

const db = {};

// Dynamically load models
fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
