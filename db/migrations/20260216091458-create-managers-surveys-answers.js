'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('managers_surveys_answers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      survey_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'managers_survey',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // delete answers if survey deleted
      },

      answer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'system_survey_answers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Recommended indexes
    await queryInterface.addIndex('managers_surveys_answers', ['survey_id']);
    await queryInterface.addIndex('managers_surveys_answers', ['answer_id']);

    // Optional: prevent duplicate answer selection per survey
    await queryInterface.addConstraint('managers_surveys_answers', {
      fields: ['survey_id', 'answer_id'],
      type: 'unique',
      name: 'unique_survey_answer'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('managers_surveys_answers');
  },
};