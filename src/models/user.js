"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many RefreshTokens
      User.hasMany(models.RefreshToken, {
        foreignKey: "userId",
        as: "refreshTokens",
      });
      // User has many Reports
      User.hasMany(models.Report, {
        foreignKey: "user_id",
        as: "reports",
      });
      // User has many Notifications
      User.hasMany(models.Notification, {
        foreignKey: "user_id",
        as: "notifications",
      });
      // User has many Chats
      User.hasMany(models.Chat, {
        foreignKey: "user_id",
        as: "chats",
      });
      // User has many Reports as admin
      User.hasMany(models.Report, {
        foreignKey: "admin_id",
        as: "adminReports",
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
        type: DataTypes.ENUM("user", "super-admin", "admin"),
        defaultValue: "user",
        allowNull: false,
      },
      resetPasswordToken: DataTypes.STRING,
      resetPasswordCode: DataTypes.STRING,
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