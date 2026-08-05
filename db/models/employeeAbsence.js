module.exports = (sequelize, DataTypes) => {
    const EmployeeAbsence = sequelize.define(
        'EmployeeAbsence',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            employee_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'employees',
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
            }
        },
        {
            tableName: 'employees_absence',
            timestamps: true,
            paranoid: true
        }
    );

    EmployeeAbsence.associate = (models) => {
        EmployeeAbsence.belongsTo(models.Employee, {
            foreignKey: 'employee_id',
            as: 'employee'
        });
    };

    return EmployeeAbsence;
};