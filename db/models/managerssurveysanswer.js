module.exports = (sequelize, DataTypes) => {
    const ManagersSurveysAnswer = sequelize.define(
        'ManagersSurveysAnswer',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            survey_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            answer_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'managers_surveys_answers',
            timestamps: false,
        }
    );

    ManagersSurveysAnswer.associate = (models) => {
        ManagersSurveysAnswer.belongsTo(models.ManagersSurvey, {
            foreignKey: 'survey_id',
            as: 'survey',
        });

        ManagersSurveysAnswer.belongsTo(models.SystemSurveyAnswer, {
            foreignKey: 'answer_id',
            as: 'answer',
        });
    };

    return ManagersSurveysAnswer;
};  