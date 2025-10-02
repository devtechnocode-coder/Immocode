'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Employees', {
      id_employee: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      cin: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      id_entreprise: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Entreprises',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Add index for better performance
    await queryInterface.addIndex('Employees', ['id_entreprise']);
    await queryInterface.addIndex('Employees', ['cin']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Employees');
  }
};