'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('quizzes_and_tests_template', 'category', {
      type: Sequelize.ENUM('practical', 'theory'),
      allowNull: true,
    });

    await queryInterface.addColumn('quizzes_and_tests_template', 'max_score', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'quizzes_and_tests_template',
      'max_score'
    );

    await queryInterface.removeColumn(
      'quizzes_and_tests_template',
      'category'
    );

    // PostgreSQL: remove the enum type after removing the column
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_quizzes_and_tests_template_category";'
    );
  },
};