module.exports = (sequelize, DataTypes) => {
    const WebsitePage = sequelize.define('WebsitePage', {
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
        endpoint: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'website_pages',
        timestamps: true,
        updatedAt: false,
    });

    WebsitePage.associate = (models) => {
        
    };

    return WebsitePage;
}