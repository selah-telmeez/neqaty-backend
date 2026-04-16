"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("trainers_registrations_data", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      second_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      third_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      fourth_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      whatsapp_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      certification: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      known_us: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "subjects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("trainers_registrations_data");
  },
};