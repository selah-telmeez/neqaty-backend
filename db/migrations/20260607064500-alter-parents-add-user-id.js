'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old columns
    await queryInterface.removeColumn('parents', 'username');
    await queryInterface.removeColumn('parents', 'password');

    // Add new FK column
    await queryInterface.addColumn('parents', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // make true first if table already contains data
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('parents', 'user_id');

    await queryInterface.addColumn('parents', 'username', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.addColumn('parents', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};