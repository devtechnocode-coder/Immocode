'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Equipment', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      special_identifier: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      buying_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      date_of_purchase: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      current_ammortissement: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      state: {
        type: Sequelize.ENUM('new', 'good', 'fair', 'poor', 'broken'),
        allowNull: false
      },
      user_name: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      desk_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Desks',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      section_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Sections',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add constraint to ensure equipment is assigned to either desk or section but not both
    await queryInterface.addConstraint('Equipment', {
      fields: ['desk_id', 'section_id'],
      type: 'check',
      name: 'check_desk_or_section',
      where: {
        [Sequelize.Op.or]: [
          {
            desk_id: { [Sequelize.Op.ne]: null },
            section_id: { [Sequelize.Op.eq]: null }
          },
          {
            desk_id: { [Sequelize.Op.eq]: null },
            section_id: { [Sequelize.Op.ne]: null }
          }
        ]
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Equipment');
  }
};