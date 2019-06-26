const Sequelize = require('sequelize');

const userModel = require('./user');

const sequelize = new Sequelize(process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgresql'
  });

const User = userModel(sequelize, Sequelize);

sequelize.sync().then(() => {
  console.log('Database has been initalized.');
});

module.exports = {User};
