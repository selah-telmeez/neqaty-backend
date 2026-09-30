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

// Load models (listed explicitly so serverless bundlers include every file;
// add new model files here)
[
  require('./adminsusers'),
  require('./authority'),
  require('./class'),
  require('./department'),
  require('./employee'),
  require('./employeeRole'),
  require('./organization'),
  require('./pointshistory'),
  require('./rewardsandpunishments'),
  require('./setting'),
  require('./specialization'),
  require('./student'),
  require('./teacher'),
  require('./user'),
  require('./userRole'),
  require('./userspoints'),
].forEach(defineModel => {
  const model = defineModel(sequelize, DataTypes);
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
