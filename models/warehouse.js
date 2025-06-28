'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Warehouse extends Model {
    static associate(models) {
      // Define associations here
      Warehouse.belongsTo(models.User, {
        foreignKey: 'responsable_name',
        as: 'responsable'
      });
      
      Warehouse.belongsTo(models.Site, {
        foreignKey: 'id_site',
        as: 'site'
      });
    }
  }
  
  Warehouse.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    number_of_sections: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    responsable_name: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    id_site: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Sites',
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
    modelName: 'Warehouse',
    tableName: 'Warehouses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  });
  
  return Warehouse;
}; 