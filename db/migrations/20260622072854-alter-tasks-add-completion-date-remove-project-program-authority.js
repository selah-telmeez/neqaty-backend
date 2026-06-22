'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add completion_date
    await queryInterface.addColumn('tasks', 'completion_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Remove foreign key columns
    await queryInterface.removeColumn('tasks', 'project_id');
    await queryInterface.removeColumn('tasks', 'program_id');
    await queryInterface.removeColumn('tasks', 'authority_id');
  },

  async down(queryInterface, Sequelize) {
    // Recreate removed columns
    await queryInterface.addColumn('tasks', 'project_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });

    await queryInterface.addColumn('tasks', 'program_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'programs',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });

    await queryInterface.addColumn('tasks', 'authority_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'authorities',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });

    // Remove completion_date
    await queryInterface.removeColumn('tasks', 'completion_date');
  },
};