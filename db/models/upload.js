"use strict";

module.exports = (sequelize, DataTypes) => {
    const Upload = sequelize.define(
        "Upload",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            file_path: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            deleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: "uploads",
            timestamps: false, // because you only have createdAt
        }
    );

    Upload.associate = (models) => {
        Upload.hasMany(models.ClassroomUpload, { foreignKey: "upload_id", as: "classroom_uploads" });
        Upload.hasMany(models.User, { foreignKey: 'upload_id', as: 'users' });
    }

    return Upload;
};