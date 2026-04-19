"use strict";
module.exports = (sequelize, DataTypes) => {
    const SubjectFormCategory = sequelize.define("SubjectFormCategory", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
        {
            tableName: "subject_form_categories",
            timestamps: true,
            updatedAt: false,
            createdAt: true,
        }
    );

    SubjectFormCategory.associate = (models) => {
        SubjectFormCategory.hasMany(models.Subject, {
            foreignKey: "category_id",
            as: "subjects",
        });

        SubjectFormCategory.hasMany(models.Form, {
            foreignKey: "category_id",
            as: "forms",
        });
    };

    return SubjectFormCategory;
};