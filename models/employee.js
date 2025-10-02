'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.belongsTo(models.Entreprise, {
        foreignKey: 'id_entreprise',
        as: 'entreprise'
      });
    }
  }
  
  Employee.init({
    idEmployee: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_employee'
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'last_name'
    },
    CIN: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: 'cin'
    },
    id_entreprise: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Entreprises',
        key: 'id'
      },
      field: 'id_entreprise'
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'Employees',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
  });
  
  return Employee;
};