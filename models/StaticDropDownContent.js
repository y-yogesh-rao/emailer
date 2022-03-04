"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let StaticDropDownContent = sequelize.define("StaticDropDownContent", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        name: { type: DataTypes.STRING, allowNull: false },
        value: { type: DataTypes.STRING, allowNull: false },
        fieldName: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.ACTIVE }
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "staticDropDownContents"
      }
    );

    StaticDropDownContent.associate = (models) => {
    }
    
    return StaticDropDownContent;
};  
