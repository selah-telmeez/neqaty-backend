'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('curriculums_reports', 'note', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('curriculums_reports', 'comment', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('curriculums_reports', 'note');
    await queryInterface.removeColumn('curriculums_reports', 'comment');
  }
};