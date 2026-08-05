'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Remove old columns
        await queryInterface.removeColumn('employees_absence', 'status');
        await queryInterface.removeColumn('employees_absence', 'comment');
        await queryInterface.removeColumn('employees_absence', 'deleted');

        // Add new columns
        await queryInterface.addColumn('employees_absence', 'absence_date', {
            type: Sequelize.DATEONLY,
            allowNull: false
        });

        await queryInterface.addColumn('employees_absence', 'cause', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        // Ensure deletedAt exists for paranoid
        await queryInterface.changeColumn('employees_absence', 'deletedAt', {
            type: Sequelize.DATE,
            allowNull: true
        });

        // Update FK
        await queryInterface.changeColumn('employees_absence', 'employee_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('employees_absence', 'absence_date');
        await queryInterface.removeColumn('employees_absence', 'cause');

        await queryInterface.addColumn('employees_absence', 'status', {
            type: Sequelize.ENUM('absent', 'excused'),
            allowNull: false
        });

        await queryInterface.addColumn('employees_absence', 'comment', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('employees_absence', 'deleted', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });

        await queryInterface.changeColumn('employees_absence', 'employee_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });
    }
};