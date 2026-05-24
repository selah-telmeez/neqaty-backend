module.exports = (sequelize, DataTypes) => {
    const TeacherSubject = sequelize.define('TeacherSubject', {
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
  
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      tableName: 'teacher_subjects',
      timestamps: true,
    });
  
    TeacherSubject.associate = (models) => {
  
      TeacherSubject.belongsTo(models.Teacher, {
        foreignKey: 'teacher_id',
      });
  
      TeacherSubject.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
      });
  
    };
  
    return TeacherSubject;
  };