'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'quizzes_and_tests_template';
    const dialect = queryInterface.sequelize.getDialect();

    // 1) Add organization_id column (nullable initially to avoid failing on existing rows)
    await queryInterface.addColumn(tableName, 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // 2) Update ENUM values for "type"
    const newEnumValues = [
      'test',
      'quiz',
      'اختبار تكويني',
      'اختبار تجميعي',
      'مشروع تخرج',
    ];

    if (dialect === 'postgres') {
      // In postgres, ENUM type is a DB type. Sequelize usually names it: enum_<table>_<column>
      // Here it should be: enum_quizzes_and_tests_template_type
      // We'll add missing values safely.

      const enumTypeName = 'enum_quizzes_and_tests_template_type';

      for (const val of newEnumValues) {
        // IF NOT EXISTS is supported in modern Postgres; if your version is old, you'll need a DO $$ block.
        await queryInterface.sequelize.query(
          `ALTER TYPE "${enumTypeName}" ADD VALUE IF NOT EXISTS '${val}';`
        );
      }
    } else {
      // MySQL / MariaDB / others: changeColumn with a new ENUM definition
      await queryInterface.changeColumn(tableName, 'type', {
        allowNull: false,
        type: Sequelize.ENUM(...newEnumValues),
      });
    }

    // 3) Make createdAt default NOW (CURRENT_TIMESTAMP)
    // createdAt exists because timestamps: true, but DB-level default might not be set.
    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(
        `ALTER TABLE "${tableName}" ALTER COLUMN "createdAt" SET DEFAULT NOW();`
      );
    } else {
      // MySQL/MariaDB
      await queryInterface.sequelize.query(
        `ALTER TABLE \`${tableName}\` MODIFY \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;`
      );
    }

    // OPTIONAL (recommended): if you want organization_id to be NOT NULL eventually:
    //  - First update existing rows with a valid organization_id
    //  - Then uncomment this:
    // await queryInterface.changeColumn(tableName, 'organization_id', {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   references: { model: 'organizations', key: 'id' },
    //   onUpdate: 'CASCADE',
    //   onDelete: 'RESTRICT',
    // });
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'quizzes_and_tests_template';
    const dialect = queryInterface.sequelize.getDialect();

    // revert createdAt default
    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(
        `ALTER TABLE "${tableName}" ALTER COLUMN "createdAt" DROP DEFAULT;`
      );
    } else {
      // remove default (best-effort) - some MySQL versions may keep implicit defaults
      await queryInterface.sequelize.query(
        `ALTER TABLE \`${tableName}\` MODIFY \`createdAt\` DATETIME NOT NULL;`
      );
    }

    // remove organization_id
    await queryInterface.removeColumn(tableName, 'organization_id');

    // revert enum:
    // - Postgres: removing enum values is non-trivial; you must recreate the type.
    // - MySQL: can changeColumn back easily.
    const oldEnumValues = ['test', 'quiz'];

    if (dialect === 'postgres') {
      const enumTypeName = 'enum_quizzes_and_tests_template_type';

      // Recreate enum type to only old values:
      // 1) rename old type
      await queryInterface.sequelize.query(
        `ALTER TYPE "${enumTypeName}" RENAME TO "${enumTypeName}_old";`
      );

      // 2) create new type
      await queryInterface.sequelize.query(
        `CREATE TYPE "${enumTypeName}" AS ENUM (${oldEnumValues.map(v => `'${v}'`).join(', ')});`
      );

      // 3) alter column to use new type
      await queryInterface.sequelize.query(
        `ALTER TABLE "${tableName}"
         ALTER COLUMN "type" TYPE "${enumTypeName}"
         USING "type"::text::"${enumTypeName}";`
      );

      // 4) drop old type
      await queryInterface.sequelize.query(
        `DROP TYPE "${enumTypeName}_old";`
      );
    } else {
      await queryInterface.changeColumn(tableName, 'type', {
        allowNull: false,
        type: Sequelize.ENUM(...oldEnumValues),
      });
    }
  },
};