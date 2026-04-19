'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('system_survey_answers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      survey_question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'system_survey_questions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // or CASCADE if you want answers deleted when question deleted
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Optional (recommended) index
    await queryInterface.addIndex('system_survey_answers', ['survey_question_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('system_survey_answers');
  },
};