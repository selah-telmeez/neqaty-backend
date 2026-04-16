'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('individual_reports', 'note', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('individual_reports', 'comment', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('individual_reports', 'note');
    await queryInterface.removeColumn('individual_reports', 'comment');
  }
};