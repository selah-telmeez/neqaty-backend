'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('managers_survey', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // delete survey if user deleted (recommended)
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Recommended index
    await queryInterface.addIndex('managers_survey', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('managers_survey');
  },
};