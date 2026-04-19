'use strict';

module.exports = (sequelize, DataTypes) => {
    const ExamField = sequelize.define(
        'ExamField',
        {
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

            code: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            exam_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            tableName: 'exams_fields',
            timestamps: false,
            underscored: true,
        }
    );

    ExamField.associate = (models) => {
        ExamField.belongsTo(models.Exam, {
            foreignKey: 'exam_id',
            as: 'exam',
        });
        ExamField.hasMany(models.McqQuestion, {
            foreignKey: 'field_id',
            as: 'questions',
        });

    };

    return ExamField;
};