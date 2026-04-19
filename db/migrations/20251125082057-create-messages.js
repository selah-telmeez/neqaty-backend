"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("chat_messages", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        allowNull: false,
        primaryKey: true,
      },

      room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "chat_rooms",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      sender_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      message_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      file_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      file_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("chat_messages");
  },
};