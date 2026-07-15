"use strict";

module.exports = (sequelize, DataTypes) => {
  const ClassroomUpload = sequelize.define(
    "ClassroomUpload",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      classroom_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      upload_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "classrooms_uploads",
      timestamps: true,
    }
  );

  ClassroomUpload.associate = (models) => {
    ClassroomUpload.belongsTo(models.ClassRoom, {
      foreignKey: "classroom_id",
      as: "classroom",
    });

    ClassroomUpload.belongsTo(models.Upload, {
      foreignKey: "upload_id",
      as: "upload",
    });

    ClassroomUpload.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return ClassroomUpload;
};