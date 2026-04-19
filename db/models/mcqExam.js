'use strict';

module.exports = (sequelize, DataTypes) => {
    const McqExam = sequelize.define('McqExam',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            exam_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        },
        {
            tableName: 'mcq_exams',
            timestamps: true,
            updatedAt: false
        }
    );

    McqExam.associate = models => {
        McqExam.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        McqExam.belongsTo(models.Exam, {
            foreignKey: 'exam_id',
            as: 'exam'
        });

        McqExam.hasMany(models.McqAnswer, {
            foreignKey: 'exam_id',
            as: 'answers'
        });
    };

    return McqExam;
};