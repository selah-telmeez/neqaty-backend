module.exports = (sequelize, DataTypes) => {
  const ChatRoom = sequelize.define(
    "ChatRoom",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING
    },
    {
      tableName: "chat_rooms",
      updatedAt: false
    }
  );

  ChatRoom.associate = (models) => {
    ChatRoom.hasMany(models.ChatMessage, {
      foreignKey: "room_id",
      as: "messages",
    });
    ChatRoom.hasOne(models.Task, { foreignKey: 'chat_room_id', as: 'chatRoom' });
  };

  return ChatRoom;
};