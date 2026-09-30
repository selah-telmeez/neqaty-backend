module.exports = (sequelize, DataTypes) => {
    const Teacher = sequelize.define('Teacher', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        planned_sessions: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_sessions: {
            type: DataTypes.INTEGER,
        },
        type: {
            type: DataTypes.ENUM('government', 'private'),
            allowNull: false,
            defaultValue: 'government',
        },
        employee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'departments',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'teachers',
        timestamps: true,
    });

    Teacher.associate = (models) => {
        Teacher.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
        Teacher.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
    };

    return Teacher;
}