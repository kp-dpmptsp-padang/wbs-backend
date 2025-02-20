"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      Report.hasMany(models.Report_File, {
        foreignKey: "report_id",
        as: "files",
      });
      Report.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Report.belongsTo(models.User, {
        foreignKey: "adminId",
        as: "admin",
      });
    }
  }
  Report.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      violation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      actors: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      detail: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      unique_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "menunggu-verifikasi",
          "diproses",
          "ditolak",
          "selesai"
        ),
        allowNull: false,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_anonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Report",
    }
  );
  return Report;
};
