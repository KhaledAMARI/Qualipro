const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: true },
  lastName: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
