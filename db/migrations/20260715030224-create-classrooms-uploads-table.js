"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("classrooms_uploads", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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

      upload_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "uploads",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
      "classrooms_uploads",
      ["classroom_id", "upload_id"],
      {
        unique: true,
        name: "classrooms_uploads_classroom_upload_unique",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("classrooms_uploads");
  },
};