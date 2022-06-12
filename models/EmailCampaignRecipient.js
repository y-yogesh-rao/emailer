"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let EmailCampaignRecipient = sequelize.define("EmailCampaignRecipient", {
        id: {
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            type: DataTypes.INTEGER,
        },
        recipientId: { type: DataTypes.INTEGER, allowNull: false },
        emailCampaignId: { type: DataTypes.INTEGER, allowNull: false },
        content: { type: DataTypes.BLOB, defaultValue: null },
        sent: { type: DataTypes.BOOLEAN, defaultValue: false },
        opened: { type: DataTypes.BOOLEAN, defaultValue: false },
        clicked: { type: DataTypes.BOOLEAN, defaultValue: false },
        delivered: { type: DataTypes.BOOLEAN, defaultValue: false },
        unsubsribed: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "emailCampaignRecipients"
      }
    );

    EmailCampaignRecipient.associate = (models) => {
        EmailCampaignRecipient.belongsTo(models.Recipient, { foreignKey: 'recipientId' });
        EmailCampaignRecipient.belongsTo(models.EmailCampaign, { foreignKey: 'emailCampaignId' });
    };

    return EmailCampaignRecipient;
}; 