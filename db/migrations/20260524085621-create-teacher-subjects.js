'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // 1. create junction table
    await queryInterface.createTable('teacher_subjects', {
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teachers',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 2. optional composite primary key
    await queryInterface.addConstraint('teacher_subjects', {
      fields: ['teacher_id', 'subject_id'],
      type: 'primary key',
      name: 'teacher_subjects_pkey',
    });

    // 3. migrate existing data
    await queryInterface.sequelize.query(`
      INSERT INTO teacher_subjects
      ("teacher_id", "subject_id", "createdAt", "updatedAt")
      SELECT id, subject_id, NOW(), NOW()
      FROM teachers
      WHERE subject_id IS NOT NULL
    `);

    // 4. remove old column
    await queryInterface.removeColumn('teachers', 'subject_id');
  },

  async down(queryInterface, Sequelize) {

    // 1. restore old column
    await queryInterface.addColumn('teachers', 'subject_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'subjects',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });

    // 2. restore data
    await queryInterface.sequelize.query(`
      UPDATE teachers t
      SET subject_id = ts.subject_id
      FROM teacher_subjects ts
      WHERE ts.teacher_id = t.id
    `);

    // 3. drop junction table
    await queryInterface.dropTable('teacher_subjects');
  },
};