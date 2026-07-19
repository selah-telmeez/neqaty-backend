'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'upload_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'uploads',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'upload_id');
  },
};