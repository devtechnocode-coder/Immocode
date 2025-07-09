'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Desk extends Model {
    static associate(models) {
      Desk.belongsTo(models.Department, {
        foreignKey: 'id_department',
        as: 'department'
      });
    }
  }
  Desk.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    id_department: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'id'
      }
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Desk',
    tableName: 'Desks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  });
  return Desk;
}; 