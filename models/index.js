"use strict";
var sequelize = new Sequelize(
  process.env.MYSQL_DATABASE_NAME,
  process.env.MYSQL_USERNAME,
  process.env.MYSQL_PASSWORD,
  {
    define: {
      charset: "utf8",
      collate: "utf8_general_ci"
    },
    host: process.env.MYSQL_HOST,
    dialect: process.env.MYSQL_DIALECT,
    dialectOptions:{
      ssl: {rejectUnauthorized:false}
    },
    port: process.env.MYSQL_PORT,
    operatorsAliases: process.env.OPERATORS_ALIASES,
    pool: {
        max: +process.env.DB_POOL_MAX,
        min: +process.env.DB_POOL_MIN,
        acquire:process.env.DB_POOL_ACQUIRE,
        idle:process.env.DB_POOL_IDLE
    }
  }
);
var db = {};
Fs.readdirSync(__dirname)
  .filter(function(file) {
    return file.indexOf(".") !== 0 && file !== "index.js";
  })
  .forEach(function(file) {
    var model = require(Path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});
db.sequelize = sequelize;
module.exports = db;
