'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('pe_candidates', 'candidate_picture', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('pe_candidates', 'candidate_passport', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('pe_candidates', 'candidate_ticket', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('pe_candidates', 'candidate_picture_passport', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('pe_candidates', 'candidate_picture_ticket', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('pe_candidates', 'fc_back_img', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('pe_candidates', 'fc_side_img', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('pe_candidates', 'practical_back_img', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('pe_candidates', 'practical_side_img', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('pe_candidates', 'theory_back_img', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('pe_candidates', 'theory_side_img', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn('pe_candidates', 'candidate_picture'),
      queryInterface.removeColumn('pe_candidates', 'candidate_passport'),
      queryInterface.removeColumn('pe_candidates', 'candidate_ticket'),
      queryInterface.removeColumn('pe_candidates', 'candidate_picture_passport'),
      queryInterface.removeColumn('pe_candidates', 'candidate_picture_ticket'),
      queryInterface.removeColumn('pe_candidates', 'fc_back_img'),
      queryInterface.removeColumn('pe_candidates', 'fc_side_img'),
      queryInterface.removeColumn('pe_candidates', 'practical_back_img'),
      queryInterface.removeColumn('pe_candidates', 'practical_side_img'),
      queryInterface.removeColumn('pe_candidates', 'theory_back_img'),
      queryInterface.removeColumn('pe_candidates', 'theory_side_img'),
    ]);
  },
};