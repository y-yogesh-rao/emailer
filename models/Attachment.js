"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    const Attachment = sequelize.define("Attachment", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            inUse: { type: DataTypes.INTEGER, defaultValue: 0 },
            path: { type: DataTypes.STRING, defaultValue: null },
            userId: { type: DataTypes.INTEGER, defaultValue: null },
            uniqueName: { type: DataTypes.STRING, allowNull: false },
            extension: { type: DataTypes.STRING, defaultValue: null },
            size: { type: DataTypes.INTEGER, comment: "Size is stored in KB", defaultValue: null },
        },
        {
            underscored: true,
            tableName: "attachments"
        }
    );

    Attachment.associate = (models) => {
        Attachment.belongsTo(models.User, { foreignKey: "userId", allowNull: true });
    };

    return Attachment;
}