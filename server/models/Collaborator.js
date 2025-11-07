const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Collaborator = sequelize.define('Collaborator', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  post: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'collaborators',
  timestamps: true,
});

module.exports = Collaborator;
