'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('classes', 'stage_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'stages',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('classes', 'stage_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'stages',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });
  }
};