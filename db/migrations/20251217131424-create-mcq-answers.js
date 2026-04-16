'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mcq_answers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      choice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mcq_choices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      exam_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mcq_exams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mcq_questions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // 🔹 Performance indexes (important)
    await queryInterface.addIndex('mcq_answers', ['exam_id']);
    await queryInterface.addIndex('mcq_answers', ['question_id']);
    await queryInterface.addIndex('mcq_answers', ['choice_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('mcq_answers');
  }
};