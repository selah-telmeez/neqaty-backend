'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('quizzes_and_tests_template', 'start_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('quizzes_and_tests_template', 'end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('quizzes_and_tests_template', 'start_date');
    await queryInterface.removeColumn('quizzes_and_tests_template', 'end_date');
  },
};