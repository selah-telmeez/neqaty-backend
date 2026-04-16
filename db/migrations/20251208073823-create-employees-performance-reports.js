'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employees_performance_reports', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      planned_working_days: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      actual_working_days: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      absence_days: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      no_of_latness: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      no_of_early_leave: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      score_one: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      score_two: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      score_three: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      score_four: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      score_five: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      score_six: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('employees_performance_reports');
  }
};