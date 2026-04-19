module.exports = (sequelize, DataTypes) => {
    const Parent = sequelize.define('Parent', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
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
        Parent.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
    };

    return Parent;
};
