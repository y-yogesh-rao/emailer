"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let User = sequelize.define("User", {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: DataTypes.INTEGER,
        },
        roleId: { type: DataTypes.INTEGER, allowNull: false },
        accountId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
        password:{ type: DataTypes.STRING,allowNull: false },
        countryCode: { type: DataTypes.STRING, defaultValue: '+91' },
        email: { type: DataTypes.STRING, allowNull: false, unique: 'email' },
        username: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.ACTIVE },
        phoneNumber: { type: DataTypes.STRING, allowNull: false, unique: 'phoneNumber'},
        tokenStatus: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.INACTIVE },
        dailyEmailLimit: { type: DataTypes.INTEGER, defaultValue: Constants.USER_EMAIL_LIMIT },
        emailsRemaining: { type: DataTypes.INTEGER, defaultValue: Constants.USER_EMAIL_LIMIT },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "users",
      }
    );

    User.associate = (models) => {
      User.belongsTo(models.Role, { foreignKey: 'roleId' });
      User.hasOne(models.UserProfile, { foreignKey: 'userId' });
      User.hasMany(models.UserSetting, { foreignKey: 'userId' });
    };

    return User;
  };  