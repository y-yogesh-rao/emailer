"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let Email = sequelize.define("Email", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        accountId: { type: DataTypes.INTEGER, allowNull: false },
        emailTemplateId: { type: DataTypes.INTEGER, defaultValue: null },
        content: { type: DataTypes.TEXT, allowNull: false},
        recipients:{ type: DataTypes.TEXT, defaultValue: null },
        opened: { type: DataTypes.BOOLEAN, defaultValue: false },
        fromEmail: { type: DataTypes.STRING, defaultValue: null },
        attachments: { type: DataTypes.TEXT, defaultValue: null },
        clicked: { type: DataTypes.BOOLEAN, defaultValue: false },
        delivered: { type: DataTypes.BOOLEAN, defaultValue: false },
        unsubsribed: { type: DataTypes.BOOLEAN, defaultValue: false },
        status: { type: DataTypes.INTEGER, allowNull:false, defaultValue: Constants.STATUS.ACTIVE },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "emails"
      }
    );

    Email.associate = (models) => {
      Email.belongsTo(models.User, { foreignKey: "accountId"});
      Email.belongsTo(models.EmailTemplate, { foreignKey: "emailTemplateId"});
    };

    return Email;
}; 