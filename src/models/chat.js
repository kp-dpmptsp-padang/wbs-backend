"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association with Report
      Chat.belongsTo(models.Report, {
        foreignKey: "report_id",
        as: "report",
      });

      // Define association with User
      Chat.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  Chat.init(
    {
      report_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Reports",
          key: "id",
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Chat",
      tableName: "Chats",
    }
  );

  return Chat;
};
