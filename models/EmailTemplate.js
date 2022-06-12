"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let EmailTemplate = sequelize.define("EmailTemplate", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        createdById: { type: DataTypes.INTEGER, allowNull: false },
        lastUpdatedById: { type: DataTypes.INTEGER, allowNull: false },
        accountId: { type: DataTypes.INTEGER, defaultValue: null, unique: 'emailTemplate' },
        code: { type: DataTypes.STRING, allowNull: false, unique: 'emailTemplate' },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.ACTIVE },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "emailTemplates"
      }
    );
    
    EmailTemplate.associate = (models) => {
      EmailTemplate.belongsTo(models.User, { foreignKey: "accountId", as: "Account" });
      EmailTemplate.hasMany(models.EmailTemplateContent, { foreignKey: "emailTemplateId", onDelete: 'cascade' });
      EmailTemplate.hasMany(models.EmailCampaignRecipient, { foreignKey: "emailTemplateId",onDelete: 'cascade', hooks:true });
      EmailTemplate.hasMany(models.EmailTemplateContent, { foreignKey: "emailTemplateId", onDelete: 'cascade', hooks:true, as:"mainContent" });
      EmailTemplate.hasMany(models.EmailTemplateContent, { foreignKey: "emailTemplateId", onDelete: 'cascade', hooks:true, as:"defaultContent" });
    };

    return EmailTemplate;
}; 