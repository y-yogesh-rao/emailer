"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let List = sequelize.define("List", {
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
        tableName: "lists",
      }
    );

    List.associate = (models) => {
      List.belongsToMany(models.Recipient, { through: 'recipient_lists', foreignKey: 'listId', otherKey: 'recipientId' });
    }
    
    return List;
};  
