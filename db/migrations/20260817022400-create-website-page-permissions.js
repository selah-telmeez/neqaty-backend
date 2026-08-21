'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('website_page_permissions', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            page_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'website_pages',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },

            user_role_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users_role',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },

            can_view: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            can_create: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            can_update: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            can_delete: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.addConstraint('website_page_permissions', {
            fields: ['page_id', 'user_role_id'],
            type: 'unique',
            name: 'website_page_permissions_page_role_unique',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('website_page_permissions');
    },
};