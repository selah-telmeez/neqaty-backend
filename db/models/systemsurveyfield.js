module.exports = (sequelize, DataTypes) => {
    const SystemSurveyField = sequelize.define('SystemSurveyField', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'system_survey_fields',
        timestamps: false,
    });

    SystemSurveyField.associate = (models) => {
        SystemSurveyField.hasMany(models.SystemSurveyQuestion, {
            foreignKey: 'survey_field_id',
            as: 'questions',
        });
    };

    return SystemSurveyField;
};