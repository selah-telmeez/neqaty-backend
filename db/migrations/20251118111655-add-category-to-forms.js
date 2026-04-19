"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("forms", "category_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });

    await queryInterface.addConstraint("forms", {
      fields: ["category_id"],
      type: "foreign key",
      name: "fk_forms_category_id",
      references: {
        table: "subject_form_categories",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "forms",
      "fk_forms_category_id"
    );

    await queryInterface.removeColumn("forms", "category_id");
  },
};