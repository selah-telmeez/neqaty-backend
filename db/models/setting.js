// Simple key/value settings (e.g. the neqaty navbar logo, stored as base64)
module.exports = (sequelize, DataTypes) => {
    const Setting = sequelize.define('Setting', {
        key: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
        },
        value: {
            allowNull: false,
            type: DataTypes.TEXT,
        },
    }, {
        tableName: 'settings',
        timestamps: true,
    });

    return Setting;
};
