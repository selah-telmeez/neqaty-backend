'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("chat_messages", {
      fields: ["sender_id"],
      type: "foreign key",
      name: "fk_chat_messages_sender",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("chat_messages", "fk_chat_messages_sender");
  }
};