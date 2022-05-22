"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let EmailTemplateContent = sequelize.define("EmailTemplateContent", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        languageId: { type: DataTypes.INTEGER, allowNull: false, unique: 'uniqueLanguage' },
        emailTemplateId: { type: DataTypes.INTEGER, allowNull: false, unique: 'uniqueLanguage' },
        content: { type: DataTypes.TEXT, allowNull: false },
        subject: { type: DataTypes.TEXT, allowNull: false },
        replacements: { type: DataTypes.TEXT, defaultValue: null },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "emailTemplateContents"
      }
    );

    EmailTemplateContent.associate = (models) => {
      EmailTemplateContent.belongsTo(models.Language, { foreignKey: "languageId" });
      EmailTemplateContent.belongsTo(models.EmailTemplate, { foreignKey: "emailTemplateId" });
    };

    return EmailTemplateContent;
}; 