'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) organization_id (FK -> organizations.id)
    await queryInterface.addColumn('classRooms', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });

    await queryInterface.addConstraint('classRooms', {
      fields: ['organization_id'],
      type: 'foreign key',
      name: 'fk_classrooms_organization_id',
      references: {
        table: 'organizations',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // or 'CASCADE' if you want classrooms deleted when org deleted
    });

    // 2) room_type ENUM
    await queryInterface.addColumn('classRooms', 'room_type', {
      type: Sequelize.ENUM('class', 'workshop', 'lab'),
      allowNull: false,
      defaultValue: 'class', // optional
    });

    // 3) createdAt default now (DB-level default)
    // This works well for MySQL/MariaDB/Postgres in most cases:
    await queryInterface.changeColumn('classRooms', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
  },

  async down(queryInterface, Sequelize) {
    // remove FK constraint first
    await queryInterface.removeConstraint('classRooms', 'fk_classrooms_organization_id');

    await queryInterface.removeColumn('classRooms', 'organization_id');
    await queryInterface.removeColumn('classRooms', 'room_type');

    // IMPORTANT (Postgres): drop enum type created by Sequelize for room_type
    // Safe to attempt; for MySQL it won't exist.
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_classRooms_room_type";');
    }

    // revert createdAt default (keeps column not-null)
    await queryInterface.changeColumn('classRooms', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};