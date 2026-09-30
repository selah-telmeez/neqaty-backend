module.exports = (sequelize, DataTypes) => {

  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    code: {
      allowNull: false,
      type: DataTypes.INTEGER,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users_role',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    upload_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  }, {
    paranoid: true,
    tableName: 'users',
    timestamps: true,
    updatedAt: false,
  });

  User.associate = (models) => {
    User.belongsTo(models.UserRole, { foreignKey: 'role_id', as: 'role' });
    User.hasOne(models.Employee, { foreignKey: 'user_id', as: 'employee' });
    User.hasOne(models.Student, { foreignKey: 'user_id', as: 'student' });
    User.hasOne(models.UsersPoints, { foreignKey: 'user_id', as: 'points' });
    User.hasOne(models.AdminsUsers, { foreignKey: 'user_id', as: 'admin' });
  };

  return User;
};
