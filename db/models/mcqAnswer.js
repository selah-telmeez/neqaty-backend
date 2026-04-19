'use strict';

module.exports = (sequelize, DataTypes) => {
  const McqAnswer = sequelize.define(
    'McqAnswer',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      choice_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      exam_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      question_id: {
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
      tableName: 'mcq_answers',
      timestamps: true,
      updatedAt: false
    }
  );

  McqAnswer.associate = models => {
    McqAnswer.belongsTo(models.McqExam, {
      foreignKey: 'exam_id',
      as: 'exam'
    });

    McqAnswer.belongsTo(models.McqQuestion, {
      foreignKey: 'question_id',
      as: 'question'
    });

    McqAnswer.belongsTo(models.McqChoice, {
      foreignKey: 'choice_id',
      as: 'choice'
    });
  };

  return McqAnswer;
};