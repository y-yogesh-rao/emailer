"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let Permission = sequelize.define("Permission", {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: DataTypes.INTEGER,
        },
        permissionCode: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.ACTIVE }
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "permissions"
      }
    );

    Permission.associate = (models) => {
      Permission.belongsToMany(models.Role, { through: 'rolePermissions', foreignKey: 'permissionId', otherKey: 'roleId' });
    }
    
    return Permission;
};  
