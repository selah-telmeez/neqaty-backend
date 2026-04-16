module.exports = (sequelize, DataTypes) => {
    const SystemSurveyQuestion = sequelize.define(
        'SystemSurveyQuestion',
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

            survey_field_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'system_survey_fields',
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
            tableName: 'system_survey_questions',
            timestamps: false,
        }
    );

    SystemSurveyQuestion.associate = (models) => {
        SystemSurveyQuestion.belongsTo(models.SystemSurveyField, {
            foreignKey: 'survey_field_id',
            as: 'surveyField',
        });
        SystemSurveyQuestion.hasMany(models.SystemSurveyAnswer, {
            foreignKey: 'survey_question_id',
            as: 'answers',
        });
    };

    return SystemSurveyQuestion;
};  