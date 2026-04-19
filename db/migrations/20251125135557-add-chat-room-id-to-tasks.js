'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tasks', 'chat_room_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'chat_rooms',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tasks', 'chat_room_id');
  }
};