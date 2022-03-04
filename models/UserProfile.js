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
      gender: { type: DataTypes.STRING, defaultValue: null },
      lastName: { type: DataTypes.STRING, defaultValue: null },
      firstName: { type: DataTypes.STRING, defaultValue: null },
      status: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.ACTIVE },
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