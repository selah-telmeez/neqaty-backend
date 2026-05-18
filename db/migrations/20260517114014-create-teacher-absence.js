'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('teacher_absence', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            teacher_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'teachers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            absence_date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },

            cause: {
                type: Sequelize.TEXT,
                allowNull: true
            },

            deleted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },

            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('teacher_absence');
    }
};