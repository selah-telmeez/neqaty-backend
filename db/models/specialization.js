module.exports = (sequelize, DataTypes) => {
    const Specialization = sequelize.define('Specialization', {
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
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'specializations',
        timestamps: true,
        updatedAt: false,
    });

    Specialization.associate = (models) => {
        Specialization.hasMany(models.Student, { foreignKey: 'specialization_id', as: 'students' });
        Specialization.hasMany(models.SubjectSpecialization, { foreignKey: 'specialization_id', as: 'subject' });
        Specialization.belongsToMany(models.Organization, { through: 'organization_specializations', as: 'organizations', foreignKey: 'specialization_id' });
        Specialization.hasMany(models.Class, { foreignKey: 'specialization_id', as: 'classes' });
    };

    return Specialization;
}