"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Report, {
        foreignKey: "userId",
        as: "reports",
      });
      User.hasMany(models.Report, {
        foreignKey: "adminId",
        as: "adminReports",
      });
      User.hasMany(models.RefreshToken, {
        foreignKey: "userId",
        as: "refreshTokens",
      });
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(
          "pelapor",
          "super-admin",
          "admin-verifikator",
          "admin-prosesor"
        ),
        defaultValue: "pelapor",
        allowNull: false,
      },
      resetPasswordToken: DataTypes.STRING,
      resetPasswordExpires: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
    }
  );
  return User;
};
