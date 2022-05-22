"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let Token = sequelize.define("Token", {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: DataTypes.INTEGER,
        },
        code: { type: DataTypes.STRING, allowNull: true },
        token: { type: DataTypes.TEXT, allowNull: false },
        userId: { type: DataTypes.INTEGER, defaultValue: null },
        type: { type: DataTypes.STRING, allowNull: false, unique: 'token' },
        email: { type: DataTypes.STRING, allowNull: false, unique: 'token' },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.INACTIVE },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "tokens",
      }
    );

    return Token;
};  
