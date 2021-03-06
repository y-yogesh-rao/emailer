"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let Sender = sequelize.define("Sender", {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: DataTypes.INTEGER,
        },
        accountId: { type: DataTypes.INTEGER, defaultValue: null },
        createdById: { type: DataTypes.INTEGER, defaultValue: null },
        lastUpdatedById: { type: DataTypes.INTEGER, defaultValue: null },
        city: { type: DataTypes.STRING, defaultValue: null },
        state: { type: DataTypes.STRING, defaultValue: null },
        country: { type: DataTypes.STRING, defaultValue: null },
        replyTo: { type: DataTypes.STRING, defaultValue: null },
        senderName: { type: DataTypes.STRING, allowNull: false },
        senderEmail: { type: DataTypes.STRING, allowNull: false },
        postalCode: { type: DataTypes.STRING, defaultValue: null },
        companyName: { type: DataTypes.STRING, defaultValue: null },
        companyAddressLine_1: { type: DataTypes.TEXT, defaultValue: null },
        companyAddressLine_2: { type: DataTypes.TEXT, defaultValue: null },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.INACTIVE },
      },
      {
        underscored: true,
        tableName: "senders",
      }
    );

    Sender.associate = (models) => {
        Sender.belongsTo(models.User, { foreignKey: 'accountId', as: 'Account' });
        Sender.belongsTo(models.User, { foreignKey: 'createdById', as: 'CreatedBy' });
        Sender.belongsTo(models.User, { foreignKey: 'lastUpdatedById', as: 'LastUpdatedBy' });
    }
    
    return Sender;
};  
