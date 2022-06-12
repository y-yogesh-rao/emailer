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
        dob: { type: DataTypes.DATE, defaultValue: null },
        city: { type: DataTypes.STRING, defaultValue: null },
        state: { type: DataTypes.STRING, defaultValue: null },
        gender: { type: DataTypes.STRING, defaultValue: null },
        country: { type: DataTypes.STRING, defaultValue: null },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, defaultValue: null },
        postalCode: { type: DataTypes.STRING, defaultValue: null },
        companyName: { type: DataTypes.STRING, defaultValue: null },
        addressLine_1: { type: DataTypes.TEXT, defaultValue: null },
        addressLine_2: { type: DataTypes.TEXT, defaultValue: null },
        recipientEmail: { type: DataTypes.STRING, allowNull: false },
        alternateEmail: { type: DataTypes.STRING, defaultValue: null },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.ACTIVE },
      },
      {
        underscored: true,
        tableName: "recipients",
      }
    );

    Recipient.associate = (models) => {
        Recipient.belongsTo(models.Attachment, { foreignKey: 'attachmentId' });
        Recipient.belongsTo(models.User, { foreignKey: 'accountId', as: 'Account' });
        Recipient.belongsTo(models.User, { foreignKey: 'createdById', as: 'CreatedBy' });
        Recipient.belongsTo(models.User, { foreignKey: 'lastUpdatedById', as: 'LastUpdatedBy' });
        Recipient.belongsToMany(models.List, { through: 'recipient_lists', foreignKey: 'recipientId', otherKey: 'listId' });
    }
    
    return Recipient;
};  
