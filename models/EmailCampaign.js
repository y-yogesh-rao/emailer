"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let EmailCampaign = sequelize.define("EmailCampaign", {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: DataTypes.INTEGER,
        },
        senderId: { type: DataTypes.INTEGER, allowNull: false },
        accountId: { type: DataTypes.INTEGER, allowNull: false },
        createdById: { type: DataTypes.INTEGER, allowNull: false },
        lastUpdatedById: { type: DataTypes.INTEGER, allowNull: false },
        emailTemplateId: { type: DataTypes.INTEGER, defaultValue: null },
        name: { type: DataTypes.STRING, allowNull: false },
        subject: { type: DataTypes.TEXT, defaultValue: null },
        content: { type: DataTypes.TEXT, defaultValue: null },
        scheduledAt: { type: DataTypes.DATE, defaultValue: null },
        attachments: { type: DataTypes.TEXT, defaultValue: null },
        status: { type: DataTypes.INTEGER, allowNull:false, defaultValue: Constants.EMAIL_CAMPAIGN_STATUS.DRAFT },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "email_campaigns"
      }
    );

    EmailCampaign.associate = (models) => {
      EmailCampaign.belongsTo(models.Sender, { foreignKey: "senderId" });
      EmailCampaign.belongsTo(models.EmailTemplate, { foreignKey: "emailTemplateId" });
      EmailCampaign.belongsTo(models.User, { foreignKey: "accountId", as: 'Account' });
      EmailCampaign.belongsTo(models.User, { foreignKey: "createdById", as: 'CreatedBy' });
      EmailCampaign.hasMany(models.EmailCampaignRecipient, { foreignKey: "emailCampaignId" });
      EmailCampaign.belongsTo(models.User, { foreignKey: "lastUpdatedById", as: 'LastUpdatedBy' });
    };

    return EmailCampaign;
}; 