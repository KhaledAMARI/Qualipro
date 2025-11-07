const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'app_db',
  process.env.DB_USER || 'app_user',
  process.env.DB_PASS || 'app_password',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = { sequelize };
