'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'classes',
      'status',
      {
        type: Sequelize.ENUM('ongoing', 'finished', 'onhold', 'cancelled'),
        allowNull: false,
        defaultValue: 'ongoing'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('classes', 'status');

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_classes_status";
    `);
  }
};