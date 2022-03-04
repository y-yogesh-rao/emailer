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
        content: { type: DataTypes.TEXT, allowNull: false},
        userId: { type: DataTypes.INTEGER, allowNull: false },
        attachments: { type: DataTypes.TEXT, defaultValue: null},
        emailTemplateId: { type: DataTypes.INTEGER, allowNull: false },
        status:{ type: DataTypes.INTEGER, allowNull:false, defaultValue: Constants.STATUS.ACTIVE },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "emails"
      }
    );
    Email.associate = function(models) {
      Email.belongsTo(models.User, { foreignKey: "userId"});
      Email.belongsTo(models.EmailTemplate, { foreignKey: "emailTemplateId"});
    };
    return Email;
}; 