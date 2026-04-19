'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('mcq_questions', 'field_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'exams_fields',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('mcq_questions', 'field_id');
  },
};