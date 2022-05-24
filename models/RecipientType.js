"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let RecipientType = sequelize.define("RecipientType", {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: DataTypes.INTEGER,
        },
        accountId: { type: DataTypes.INTEGER, defaultValue: null },
        createdById: { type: DataTypes.INTEGER, defaultValue: null },
        lastUpdatedById: { type: DataTypes.INTEGER, defaultValue: null },
        name: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.ACTIVE },
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "recipientTypes",
      }
    );

    RecipientType.associate = (models) => {
      RecipientType.hasMany(models.Recipient, { foreignKey: 'recipientTypeId' })
    }
    
    return RecipientType;
};  
