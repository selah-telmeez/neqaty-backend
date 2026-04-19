"use strict";

module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define(
    "ChatMessage",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      room_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message_text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      file_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      file_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "chat_messages",
      updatedAt: false,
    }
  );

  ChatMessage.associate = (models) => {
    ChatMessage.belongsTo(models.ChatRoom, {
      foreignKey: "room_id",
      as: "room",
    });
    ChatMessage.belongsTo(models.User, {
      foreignKey: "sender_id",
      as: "sender",
    });
  };

  return ChatMessage;
};