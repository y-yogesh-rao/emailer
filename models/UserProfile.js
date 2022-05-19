"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
  let UserProfile = sequelize.define("UserProfile", {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      userId: { type: DataTypes.INTEGER, allowNull: false, unique: 'userProfile' },
      attachmentId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
      dob: { type: DataTypes.DATE, defaultValue: null },
      city: { type: DataTypes.STRING, defaultValue: null },
      state: { type: DataTypes.STRING, defaultValue: null },
      gender: { type: DataTypes.STRING, defaultValue: null },
      websites: { type: DataTypes.JSON, defaultValue: null },
      firstName: { type: DataTypes.STRING, allowNull: false },
      country: { type: DataTypes.STRING, defaultValue: null },
      lastName: { type: DataTypes.STRING, defaultValue: null },
      newsletter: { type: DataTypes.TEXT, defaultValue: null },
      postalCode: { type: DataTypes.STRING, defaultValue: null },
      streetAddress: { type: DataTypes.TEXT, defaultValue: null },
      organization: { type: DataTypes.STRING, defaultValue: null },
    },
    {
      paranoid: true,
      underscored: true,
      tableName: "userProfiles"
    }
  );

  UserProfile.associate = (models) => {
    UserProfile.belongsTo(models.User, { foreignKey: "userId" });
    UserProfile.belongsTo(models.Attachment, { foreignKey: "attachmentId" });
  };

  return UserProfile;
};