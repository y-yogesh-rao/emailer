"use strict";

const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
    let Role = sequelize.define("Role", {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: DataTypes.INTEGER,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.STATUS.ACTIVE }
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "roles",
      }
    );

    Role.associate = (models) => {
      Role.belongsToMany(models.Permission, { through: 'rolePermissions', foreignKey: 'roleId', otherKey: 'permissionId' });
    }
    
    return Role;
};  
