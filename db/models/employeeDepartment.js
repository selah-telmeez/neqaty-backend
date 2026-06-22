module.exports = (sequelize, DataTypes) => {
    const EmployeeDepartment = sequelize.define('EmployeeDepartment', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: 'employee_departments',
      timestamps: true,
      updatedAt: false,
    });
  
    EmployeeDepartment.associate = (models) => {
      EmployeeDepartment.hasMany(models.Employee, {
        foreignKey: 'department_id',
        as: 'employees',
      });
    };
  
    return EmployeeDepartment;
  };