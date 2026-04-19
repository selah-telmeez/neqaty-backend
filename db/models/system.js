module.exports = (sequelize, DataTypes) => {
    const System = sequelize.define('System', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'systems',
        timestamps: true,
        updatedAt: false
    });

    System.associate = (models) => {
        System.belongsToMany(models.Organization, {
            through: 'organization_systems',
            foreignKey: 'system_id',
            otherKey: 'organization_id'
        });
    };

    return System;
}