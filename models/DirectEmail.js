"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let DirectEmail = sequelize.define("DirectEmail", {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: DataTypes.INTEGER,
        },
        accountId: { type: DataTypes.INTEGER, allowNull: false },
        subject: { type: DataTypes.TEXT, defaultValue: null },
        content: { type: DataTypes.TEXT, defaultValue: null },
        fromEmail: { type: DataTypes.STRING, allowNull: false },
        receipients: { type: DataTypes.JSON, allowNull: false },
        attachments: { type: DataTypes.TEXT, defaultValue: null },
        status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: Constants.EMAIL_CAMPAIGN_STATUS.SENT },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "direct_emails"
      }
    );

    DirectEmail.associate = (models) => {
        DirectEmail.belongsTo(models.User, { foreignKey: 'accountId', as: 'Account' });
    };

    return DirectEmail;
}; 