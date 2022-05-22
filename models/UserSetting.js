"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
  let UserSetting = sequelize.define("UserSetting", {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      apiSecret: { type: DataTypes.STRING, defaultValue: null },
      apiKeyName: { type: DataTypes.STRING, defaultValue: null },
      apiKey: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4 },
    },
    {
      paranoid: true,
      underscored: true,
      tableName: "userSettings"
    }
  );

  UserSetting.associate = (models) => {
    UserSetting.belongsTo(models.User, { foreignKey: "userId" });
  };

  return UserSetting;
};