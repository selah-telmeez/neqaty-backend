'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mcq_exams', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      exam_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'exams',
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

    // Performance indexes (KEEP THESE)
    await queryInterface.addIndex('mcq_exams', ['user_id']);
    await queryInterface.addIndex('mcq_exams', ['exam_id']);
    await queryInterface.addIndex('mcq_exams', ['createdAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('mcq_exams');
  }
};