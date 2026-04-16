'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organization_systems', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },

      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      system_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'systems',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Prevent duplicate relations
    await queryInterface.addConstraint('organization_systems', {
      fields: ['organization_id', 'system_id'],
      type: 'unique',
      name: 'unique_organization_system'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('organization_systems');
  }
};