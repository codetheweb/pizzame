const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgresql'
  });

module.exports = {db: sequelize};
