'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'id_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('employees', 'birth_place', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('employees', 'sex', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('employees', 'religion', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('employees', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('employees', 'financial_job_level', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('employees', 'qualitative_group', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('employees', 'appointment_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn(
      'employees',
      'date_of_receipt_of_current_work',
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }
    );

    await queryInterface.addColumn('employees', 'contract_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('employees', 'id_number');
    await queryInterface.removeColumn('employees', 'birth_place');
    await queryInterface.removeColumn('employees', 'sex');
    await queryInterface.removeColumn('employees', 'religion');
    await queryInterface.removeColumn('employees', 'phone_number');
    await queryInterface.removeColumn('employees', 'financial_job_level');
    await queryInterface.removeColumn('employees', 'qualitative_group');
    await queryInterface.removeColumn('employees', 'appointment_date');
    await queryInterface.removeColumn(
      'employees',
      'date_of_receipt_of_current_work'
    );
    await queryInterface.removeColumn('employees', 'contract_type');
  },
};