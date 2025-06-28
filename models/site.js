'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Site extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Site.belongsTo(models.Entreprise, { foreignKey: 'id_entreprise' });
    }
  }
  Site.init({
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    is_warehouse: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_departments: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    id_entreprise: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Entreprises',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deleted_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Site',
    tableName: 'Sites',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
  });
  return Site;
}; 