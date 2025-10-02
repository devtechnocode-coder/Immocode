'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Equipment extends Model {
    static associate(models) {
      Equipment.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      });
      Equipment.belongsTo(models.Desk, {
        foreignKey: 'desk_id',
        as: 'desk'
      });
      Equipment.belongsTo(models.Section, {
        foreignKey: 'section_id',
        as: 'section'
      });
    }
  }
  Equipment.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    special_identifier: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    buying_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    date_of_purchase: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    current_ammortissement: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    state: {
      type: DataTypes.ENUM('new', 'good', 'fair', 'poor', 'broken'),
      allowNull: false
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Employees',
        key: 'id_employee'
      },
      field: 'employee_id'
    },
    desk_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Desks',
        key: 'id'
      }
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Sections',
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
    modelName: 'Equipment',
    tableName: 'Equipment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    validate: {
      checkDeskOrSection() {
        if ((this.desk_id === null && this.section_id === null) || 
            (this.desk_id !== null && this.section_id !== null)) {
          throw new Error('Equipment must be assigned to either a desk or a section, but not both');
        }
      }
    }
  });
  return Equipment;
};