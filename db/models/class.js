module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_of_student: {
      type: DataTypes.INTEGER
    },
    no_of_teachers: {
      type: DataTypes.INTEGER
    },
    hours: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    specialization_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'specializations',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    no_of_male_students: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    no_of_female_students: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    classRoom_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'classRooms',
        key: 'id',
      },
      onDelete: 'RESTRICT'
    },
    stage_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stages',
        key: 'id',
      },
      onDelete: 'RESTRICT'
    },
    status: {
      type: DataTypes.ENUM('ongoing', 'finished', 'onhold', 'cancelled'),
      allowNull: false,
      defaultValue: 'ongoing',
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE,
    },

    // ✅ optional: only needed if you explicitly define timestamps fields in model
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    paranoid: true,
    tableName: 'classes',
    timestamps: true,
    updatedAt: false,
  });

  Class.associate = (models) => {
    Class.belongsTo(models.ClassRoom, { foreignKey: 'classRoom_id', as: 'classRoom' });
    Class.belongsTo(models.Stage, { foreignKey: 'stage_id', as: 'stage' });
    Class.belongsTo(models.Specialization, { foreignKey: 'specialization_id', as: 'specialization' });
    Class.hasMany(models.Session, { foreignKey: 'class_id', as: 'sessions' });
    Class.hasMany(models.Student, { foreignKey: 'class_id', as: 'students' });
  };

  return Class;
}