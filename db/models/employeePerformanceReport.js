'use strict';
module.exports = (sequelize, DataTypes) => {
    const EmployeePerformanceReport = sequelize.define('EmployeePerformanceReport', {

        planned_working_days: DataTypes.INTEGER,
        actual_working_days: DataTypes.INTEGER,
        absence_days: DataTypes.INTEGER,
        no_of_latness: DataTypes.INTEGER,
        no_of_early_leave: DataTypes.INTEGER,

        notes: DataTypes.TEXT,

        score_one: DataTypes.INTEGER,
        score_two: DataTypes.INTEGER,
        score_three: DataTypes.INTEGER,
        score_four: DataTypes.INTEGER,
        score_five: DataTypes.INTEGER,
        score_six: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,

    }, {
        tableName: 'employees_performance_reports'
    });

    EmployeePerformanceReport.associate = function (models) {
        EmployeePerformanceReport.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
        EmployeePerformanceReport.hasMany(models.EmployeePrTask, {
            foreignKey: 'employees_performance_reports_id',
            as: 'tasks'
        });
    };

    return EmployeePerformanceReport;
};