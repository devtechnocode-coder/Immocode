'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inventaire extends Model {
    static associate(models) {
      Inventaire.belongsTo(models.User, {
        foreignKey: 'AssociatedTo',
        as: 'associatedUser'
      });
      
      Inventaire.belongsTo(models.Desk, {
        foreignKey: 'idPlacement',
        constraints: false,
        as: 'desk'
      });
      
      Inventaire.belongsTo(models.Section, {
        foreignKey: 'idPlacement',
        constraints: false,
        as: 'section'
      });
    }
  }

  Inventaire.init({
    idInventaire: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_inventaire'
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Started', 'Done', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Pending'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    AssociatedTo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'associated_to',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    PlacementType: {
      type: DataTypes.ENUM('desk', 'section'),
      allowNull: false,
      field: 'placement_type'
    },
    idPlacement: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_placement'
    },
    totalEquipement: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_equipement'
    },
    priority: {
      type: DataTypes.ENUM('high', 'low', 'medium'),
      allowNull: false,
      defaultValue: 'medium'
    },
    inventoryType: {
      type: DataTypes.ENUM('barcode', 'rfid'),
      allowNull: false,
      field: 'inventory_type'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_deleted'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    }
  }, {
    sequelize,
    modelName: 'Inventaire',
    tableName: 'Inventaires',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    hooks: {
      beforeValidate: async (inventaire) => {
        if (!inventaire.Name) {
          const placementName = await inventaire.getPlacementName();
          const date = new Date(inventaire.startDate).toLocaleDateString();
          inventaire.Name = `${placementName}_${date}`;
        }
      },
      beforeSave: async (inventaire) => {
  // Calculate total equipment
  const { Equipment } = require('../models');
  let count = 0;
  
  if (inventaire.PlacementType === 'desk') {
    count = await Equipment.count({
      where: { 
        desk_id: inventaire.idPlacement,
        is_deleted: false  // Added this line
      }
    });
  } else if (inventaire.PlacementType === 'section') {
    count = await Equipment.count({
      where: { 
        section_id: inventaire.idPlacement,
        is_deleted: false  // Added this line
      }
    });
  }
  
  inventaire.totalEquipement = count;
}
    }
  });

  // Instance method to get placement name
  Inventaire.prototype.getPlacementName = async function() {
    const { Desk, Section } = require('../models');
    
    if (this.PlacementType === 'desk') {
      const desk = await Desk.findByPk(this.idPlacement);
      return desk ? desk.name : 'Unknown Desk';
    } else if (this.PlacementType === 'section') {
      const section = await Section.findByPk(this.idPlacement);
      return section ? section.name : 'Unknown Section';
    }
    
    return 'Unknown Placement';
  };

  return Inventaire;
};