"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let Recipient = sequelize.define("Recipient", {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: DataTypes.INTEGER,
        },
        accountId: { type: DataTypes.INTEGER, defaultValue: null },
        createdById: { type: DataTypes.INTEGER, defaultValue: null },
        attachmentId: { type: DataTypes.INTEGER, defaultValue: null },
        lastUpdatedById: { type: DataTypes.INTEGER, defaultValue: null },
        recipientTypeId: { type: DataTypes.INTEGER, defaultValue: null },
        city: { type: DataTypes.STRING, allowNull: false },
        state: { type: DataTypes.STRING, defaultValue: null },
        country: { type: DataTypes.STRING, allowNull: false },
        postalCode: { type: DataTypes.STRING, allowNull: false },
        addressLine_1: { type: DataTypes.TEXT, allowNull: false },
        addressLine_2: { type: DataTypes.TEXT, defaultValue: null },
        recipientName: { type: DataTypes.STRING, allowNull: false },
        recipientEmail: { type: DataTypes.STRING, allowNull: false },
        alternateRecipientEmail: { type: DataTypes.STRING, defaultValue: null },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.ACTIVE },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "recipients",
      }
    );

    Recipient.associate = (models) => {
        Recipient.belongsTo(models.Attachment, { foreignKey: 'attachmentId' });
        Recipient.belongsTo(models.RecipientType, { foreignKey: 'recipientTypeId' });
        Recipient.belongsTo(models.User, { foreignKey: 'accountId', as: 'Account' });
        Recipient.belongsTo(models.User, { foreignKey: 'createdById', as: 'CreatedBy' });
        Recipient.belongsTo(models.User, { foreignKey: 'lastUpdatedById', as: 'LastUpdatedBy' });
    }
    
    return Recipient;
};  
