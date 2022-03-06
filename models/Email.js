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
        emailTemplateId: { type: DataTypes.INTEGER, allowNull: false },
        fromEmail: { type: DataTypes.STRING, defaultValue: null },
        recipients:{ type: DataTypes.TEXT, defaultValue: null },
        content: { type: DataTypes.TEXT, allowNull: false},
        attachments: { type: DataTypes.TEXT, defaultValue: null },
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