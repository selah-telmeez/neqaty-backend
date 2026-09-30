module.exports = (sequelize, DataTypes) => {
    const Employee = sequelize.define('Employee', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        middle_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        birth_date: {
            type: DataTypes.DATEONLY
        },
        address: {
            type: DataTypes.STRING
        },
        qualification: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees_role',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_number: {
            type: DataTypes.STRING,
        },
        birth_place: {
            type: DataTypes.STRING,
        },
        sex: {
            type: DataTypes.STRING,
        },
        religion: {
            type: DataTypes.STRING,
        },
        phone_number: {
            type: DataTypes.STRING,
        },
        financial_job_level: {
            type: DataTypes.STRING,
        },
        qualitative_group: {
            type: DataTypes.STRING,
        },
        appointment_date: {
            type: DataTypes.DATEONLY,
        },
        date_of_receipt_of_current_work: {
            type: DataTypes.DATEONLY,
        },
        contract_type: {
            type: DataTypes.STRING,
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
        tableName: 'employees',
        timestamps: true,
        updatedAt: false,
    });

    Employee.associate = (models) => {
        Employee.belongsTo(models.EmployeeRole, { foreignKey: 'role_id', as: 'role' });
        Employee.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
        Employee.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Employee.hasOne(models.Teacher, { foreignKey: 'employee_id', as: 'teacher' });
    };

    return Employee;
}