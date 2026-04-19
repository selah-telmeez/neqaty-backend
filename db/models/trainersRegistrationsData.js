"use strict";

module.exports = (sequelize, DataTypes) => {
    const TrainersRegistrationsData = sequelize.define(
        "TrainersRegistrationsData",
        {
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: "first_name",
            },
            secondName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: "second_name",
            },
            thirdName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: "third_name",
            },
            fourthName: {
                type: DataTypes.STRING,
                allowNull: true,
                field: "fourth_name",
            },
            birthDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: "birth_date",
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    isEmail: true,
                },
            },
            phoneNumber: {
                type: DataTypes.STRING,
                allowNull: false,
                field: "phone_number",
            },
            whatsappNumber: {
                type: DataTypes.STRING,
                allowNull: true,
                field: "whatsapp_number",
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            certification: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            knownUs: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: "known_us",
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            cv: {
                type: DataTypes.STRING,
                allowNull: true,
                field: "cv",
            },
            subjectId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "subject_id",
            },
        },
        {
            tableName: "trainers_registrations_data",
            underscored: true,
            timestamps: true,
            updatedAt: false,
            createdAt: "created_at",
        }
    );

    TrainersRegistrationsData.associate = (models) => {
        TrainersRegistrationsData.belongsTo(models.Subject, {
            foreignKey: "subject_id",
            as: "subject",
        });
    };

    return TrainersRegistrationsData;
};