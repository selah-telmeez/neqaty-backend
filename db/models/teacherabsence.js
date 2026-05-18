module.exports = (sequelize, DataTypes) => {
    const TeacherAbsence = sequelize.define(
        'TeacherAbsence',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            teacher_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'teachers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            absence_date: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },

            cause: {
                type: DataTypes.TEXT,
                allowNull: true
            },

            deleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },

            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            tableName: 'teacher_absence',
            timestamps: true,
            updatedAt: false
        }
    );

    TeacherAbsence.associate = (models) => {
        TeacherAbsence.belongsTo(models.Teacher, {
            foreignKey: 'teacher_id',
            as: 'teacher'
        });
    };

    return TeacherAbsence;
};