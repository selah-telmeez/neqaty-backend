'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('classes', 'specialization_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'specializations',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('classes', 'no_of_male_students', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('classes', 'no_of_female_students', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('classes', 'start_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('classes', 'end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // ✅ set createdAt default to NOW (Postgres-safe)
    await queryInterface.sequelize.query(`
      ALTER TABLE "classes"
      ALTER COLUMN "createdAt"
      SET DEFAULT NOW();
    `);
  },

  async down(queryInterface, Sequelize) {
    // revert createdAt default (optional)
    await queryInterface.sequelize.query(`
      ALTER TABLE "classes"
      ALTER COLUMN "createdAt"
      DROP DEFAULT;
    `);

    await queryInterface.removeColumn('classes', 'end_date');
    await queryInterface.removeColumn('classes', 'start_date');
    await queryInterface.removeColumn('classes', 'no_of_female_students');
    await queryInterface.removeColumn('classes', 'no_of_male_students');
    await queryInterface.removeColumn('classes', 'specialization_id');
  }
};