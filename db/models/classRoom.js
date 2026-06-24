module.exports = (sequelize, DataTypes) => {
  const ClassRoom = sequelize.define('ClassRoom', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    room_type: {
      type: DataTypes.ENUM('class', 'workshop', 'lab'),
      allowNull: false,
      defaultValue: 'class',
    },

    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  }, {
    paranoid: true,
    tableName: 'classRooms',
    timestamps: true,
    updatedAt: false,
  });

  ClassRoom.associate = (models) => {
    ClassRoom.hasMany(models.Class, { foreignKey: 'classRoom_id', as: 'classes' });
    ClassRoom.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
    ClassRoom.hasMany(models.ClassroomEquipment, {
      foreignKey: "classroom_id",
      as: "equipments",
    });
  };

  return ClassRoom;
};