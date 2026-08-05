'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      'admins_users',
      'curriculums',
      'authorities',
      'candidates_rate_scale_answers',
      'candidates_rate_scale_exams',
      'curriculums_reports',
      'curriculums_results',
      'departments',
      'document_categories',
      'document_sub_categories',
      'employees',
      'employees_absence',
      'employees_performance_reports',
      'employees_pr_tasks',
      'employees_role',
      'environment_reports',
      'environment_results',
      'evaluation_questions',
      'fields',
      'forms',
      'incidents',
      'incidents_categories',
      'incidents_sub_categories',
      'individual_reports',
      'organizations',
      'program_organizations',
      'programs',
      'projects',
      'questions',
      'questions_manifest',
      'questions_results',
      'quizzes_and_tests',
      'scheduled_roles',
      'school_documents',
      'schools',
      'schools_structure_history',
      'specializations',
      'stages',
      'students',
      'students_attendance',
      'students_behavior',
      'students_behavior_categories',
      'students_behavior_types',
      'sub_fields',
      'subjectSpecialization',
      'subjects',
      'substitutes',
      'tasks',
      'teacher_evaluation',
      'teacher_latness',
      'teacher_subjects',
      'teachers',
      'teachers_sessions_history',
      'users',
      'users_points',
      'users_role',
      'waiting_list',
      'work_latness'
    ];

    for (const table of tables) {
      const columns = await queryInterface.describeTable(table);

      if (columns.createdAt) {
        await queryInterface.changeColumn(table, 'createdAt', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
      }

      if (columns.updatedAt) {
        await queryInterface.changeColumn(table, 'updatedAt', {
          type: Sequelize.DATE,
          allowNull: true,
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'admins_users',
      'curriculums',
      'authorities',
      'candidates_rate_scale_answers',
      'candidates_rate_scale_exams',
      'curriculums_reports',
      'curriculums_results',
      'departments',
      'document_categories',
      'document_sub_categories',
      'employees',
      'employees_absence',
      'employees_performance_reports',
      'employees_pr_tasks',
      'employees_role',
      'environment_reports',
      'environment_results',
      'evaluation_questions',
      'fields',
      'forms',
      'incidents',
      'incidents_categories',
      'incidents_sub_categories',
      'individual_reports',
      'organizations',
      'program_organizations',
      'programs',
      'projects',
      'questions',
      'questions_manifest',
      'questions_results',
      'quizzes_and_tests',
      'scheduled_roles',
      'school_documents',
      'schools',
      'schools_structure_history',
      'specializations',
      'stages',
      'students',
      'students_attendance',
      'students_behavior',
      'students_behavior_categories',
      'students_behavior_types',
      'sub_fields',
      'subjectSpecialization',
      'subjects',
      'substitutes',
      'tasks',
      'teacher_evaluation',
      'teacher_latness',
      'teacher_subjects',
      'teachers',
      'teachers_sessions_history',
      'users',
      'users_points',
      'users_role',
      'waiting_list',
      'work_latness'
    ];

    for (const table of tables) {
      const columns = await queryInterface.describeTable(table);

      if (columns.createdAt) {
        await queryInterface.changeColumn(table, 'createdAt', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: null,
        });
      }

      if (columns.updatedAt) {
        await queryInterface.changeColumn(table, 'updatedAt', {
          type: Sequelize.DATE,
          allowNull: false,
        });
      }
    }
  },
};