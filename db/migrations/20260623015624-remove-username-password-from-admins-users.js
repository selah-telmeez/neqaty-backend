'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('admins_users', 'username');
    await queryInterface.removeColumn('admins_users', 'password');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('admins_users', 'username', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.addColumn('admins_users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};