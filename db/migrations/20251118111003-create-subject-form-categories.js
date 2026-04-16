"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("subject_form_categories", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("subject_form_categories");
  },
};