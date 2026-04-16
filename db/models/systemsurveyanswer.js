module.exports = (sequelize, DataTypes) => {
    const SystemSurveyAnswer = sequelize.define(
        'SystemSurveyAnswer',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            survey_question_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'system_survey_questions',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },

            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'system_survey_answers',
            timestamps: false,
        }
    );

    SystemSurveyAnswer.associate = (models) => {
        SystemSurveyAnswer.belongsTo(models.SystemSurveyQuestion, {
            foreignKey: 'survey_question_id',
            as: 'surveyQuestion',
        });
        SystemSurveyAnswer.hasMany(models.ManagersSurveysAnswer, {
            foreignKey: 'answer_id',
            as: 'managerSelections',
        });
    };

    return SystemSurveyAnswer;
};  