module.exports = (sequelize, DataTypes) => {
    const WebsitePagePermission = sequelize.define('WebsitePagePermission', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },

        page_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'website_pages',
                key: 'id',
            },
            onDelete: "CASCADE",
        },

        user_role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users_role',
                key: 'id',
            },
            onDelete: "CASCADE",
        },

        can_view: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        can_create: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        can_update: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        can_delete: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        tableName: 'website_page_permissions',
        timestamps: true,
        updatedAt: false,
    });

    WebsitePagePermission.associate = (models) => {
        WebsitePagePermission.belongsTo(models.WebsitePage, {
            foreignKey: 'page_id',
            as: 'page'
        });

        WebsitePagePermission.belongsTo(models.UserRole, {
            foreignKey: 'user_role_id',
            as: 'userRole'
        });
    };

    return WebsitePagePermission;
}