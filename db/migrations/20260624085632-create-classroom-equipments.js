"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("classroom_equipments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      classroom_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "classRooms",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      working: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      not_working: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("classroom_equipments");
  },
};