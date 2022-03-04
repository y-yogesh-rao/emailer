"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
  let Language = sequelize.define("Language", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      status: { type: DataTypes.INTEGER, defaultValue: null },
      isDefault: { type: DataTypes.INTEGER, defaultValue: null },
      code: { type: DataTypes.STRING, allowNull: false, unique: 'language' },
      name: { type: DataTypes.STRING, allowNull: false, unique: 'language' },
    },
    {
      paranoid: true,
      underscored: true,
      tableName: "languages"
    }
  );

  Language.associate = (models) => {
    Language.hasMany(models.EmailTemplateContent, { foreignKey: "languageId"});
  };
  
  return Language;
};  
