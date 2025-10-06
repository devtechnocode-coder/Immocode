'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // First, check if Employees table exists
      const tables = await queryInterface.showAllTables();
      const employeesTableExists = tables.some(table => table.toLowerCase() === 'employees');
      
      if (!employeesTableExists) {
        throw new Error('Employees table does not exist. Please create it first by running the Employee model migration.');
      }

      // Find and remove existing foreign key constraint on user_name
      const constraints = await queryInterface.sequelize.query(
        `SELECT constraint_name 
         FROM information_schema.table_constraints 
         WHERE table_name = 'Equipment' 
         AND constraint_type = 'FOREIGN KEY' 
         AND constraint_name LIKE '%user_name%'`,
        { transaction, type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (constraints.length > 0) {
        await queryInterface.removeConstraint('Equipment', constraints[0].constraint_name, { transaction });
      }

      // Rename the column
      await queryInterface.renameColumn('Equipment', 'user_name', 'employee_id', { transaction });

      // Add the new foreign key constraint
      await queryInterface.addConstraint('Equipment', {
        fields: ['employee_id'],
        type: 'foreign key',
        name: 'Equipment_employee_id_Employees_fk',
        references: {
          table: 'Employees',
          field: 'id_employee'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        transaction
      });

      await transaction.commit();
      console.log('Equipment migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Equipment migration failed:', error.message);
      
      // If Employees table doesn't exist, provide helpful message
      if (error.message.includes('Employees table does not exist')) {
        console.log('\n⚠️  Please run the Employee migration first:');
        console.log('1. Create Employee migration: npx sequelize-cli migration:generate --name create-employees-table');
        console.log('2. Run migrations: npx sequelize-cli db:migrate');
      }
      
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove the employee foreign key constraint
      await queryInterface.removeConstraint('Equipment', 'Equipment_employee_id_Employees_fk', { transaction });
      
      // Rename the column back
      await queryInterface.renameColumn('Equipment', 'employee_id', 'user_name', { transaction });
      
      // Add back the original foreign key constraint
      await queryInterface.addConstraint('Equipment', {
        fields: ['user_name'],
        type: 'foreign key',
        name: 'Equipment_user_name_Users_fk',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};