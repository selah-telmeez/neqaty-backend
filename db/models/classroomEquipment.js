module.exports = (sequelize, DataTypes) => {
    const ClassroomEquipment = sequelize.define(
        "ClassroomEquipment",
        {
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

            classroom_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            working: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            not_working: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            reason: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            location: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            year: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            tableName: "classroom_equipments",
        }
    );

    ClassroomEquipment.associate = (models) => {
        ClassroomEquipment.belongsTo(models.ClassRoom, {
            foreignKey: "classroom_id",
            as: "classroom",
        });
    };

    return ClassroomEquipment;
};