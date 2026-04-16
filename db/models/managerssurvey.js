module.exports = (sequelize, DataTypes) => {
    const ManagersSurvey = sequelize.define(
        'ManagersSurvey',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'managers_survey',
            timestamps: false,
        }
    );

    ManagersSurvey.associate = (models) => {
        ManagersSurvey.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });
        ManagersSurvey.hasMany(models.ManagersSurveysAnswer, {
            foreignKey: 'survey_id',
            as: 'answers',
        });
    };

    return ManagersSurvey;
};  