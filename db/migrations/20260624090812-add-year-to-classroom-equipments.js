"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "classroom_equipments",
      "year",
      {
        type: Sequelize.INTEGER,
        allowNull: true, // or false if you want it required
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "classroom_equipments",
      "year"
    );
  },
};