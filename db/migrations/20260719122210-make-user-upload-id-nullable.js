'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'upload_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'uploads',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'upload_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'uploads',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });
  },
};