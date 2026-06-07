module.exports = (sequelize, DataTypes) => {
    const Parent = sequelize.define('Parent', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT',
        },

        student_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'students',
                key: 'id',
            },
            onDelete: 'RESTRICT',
        },

        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'parents',
        timestamps: true,
        updatedAt: false,
    });

    Parent.associate = (models) => {
        Parent.belongsTo(models.Student, {
            foreignKey: 'student_id',
            as: 'student',
        });

        Parent.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });
    };

    return Parent;
};