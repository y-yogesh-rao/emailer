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
        status: { type: DataTypes.INTEGER, defaultValue: null },
        code: { type: DataTypes.STRING, allowNull: false, unique: 'emailTemplate' },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "emailTemplates"
      }
    );
    
    EmailTemplate.associate = function(models) {
      EmailTemplate.hasMany(models.Email, { foreignKey: "emailTemplateId",onDelete: 'cascade', hooks:true });
      EmailTemplate.hasMany(models.EmailTemplateContent, { foreignKey: "emailTemplateId", onDelete: 'cascade' });
      EmailTemplate.hasMany(models.EmailTemplateContent, { foreignKey: "emailTemplateId", onDelete: 'cascade', hooks:true, as:"mainContent" });
      EmailTemplate.hasMany(models.EmailTemplateContent, { foreignKey: "emailTemplateId", onDelete: 'cascade', hooks:true, as:"defaultContent" });
    };

    return EmailTemplate;
}; 