"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("subjects", "category_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 2,
    });

    await queryInterface.addConstraint("subjects", {
      fields: ["category_id"],
      type: "foreign key",
      name: "fk_subjects_category_id",
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
      "subjects",
      "fk_subjects_category_id"
    );

    await queryInterface.removeColumn("subjects", "category_id");
  },
};