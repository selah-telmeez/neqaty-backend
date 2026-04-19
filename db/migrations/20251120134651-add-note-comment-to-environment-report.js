'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('environment_reports', 'note', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('environment_reports', 'comment', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('environment_reports', 'note');
    await queryInterface.removeColumn('environment_reports', 'comment');
  }
};