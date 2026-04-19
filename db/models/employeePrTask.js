'use strict';
module.exports = (sequelize, DataTypes) => {

  const EmployeePrTask = sequelize.define('EmployeePrTask', {
    task: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    employees_performance_reports_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'employees_pr_tasks'
  });

  EmployeePrTask.associate = function(models) {
    EmployeePrTask.belongsTo(models.EmployeePerformanceReport, {
      foreignKey: 'employees_performance_reports_id',
      as: 'performanceReport'
    });
  };

  return EmployeePrTask;
};