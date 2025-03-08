'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      // Report belongs to User
      Report.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      // Report belongs to Admin User
      Report.belongsTo(models.User, {
        foreignKey: "admin_id",
        as: "admin",
      });
      // Report has many Chats
      Report.hasMany(models.Chat, {
        foreignKey: "report_id",
        as: "chats",
      });
      // Report has many ReportFiles
      Report.hasMany(models.ReportFile, {
        foreignKey: "report_id",
        as: "reportFiles",
      });
    }
  }
  Report.init({
    title: DataTypes.STRING,
    violation: DataTypes.STRING,
    location: DataTypes.STRING,
    date: DataTypes.DATE,
    actors: DataTypes.STRING,
    detail: DataTypes.TEXT,
    unique_code: DataTypes.STRING,
    status: DataTypes.ENUM('menunggu-verifikasi', 'diproses', 'ditolak', 'selesai'),
    rejection_reason: DataTypes.TEXT,
    admin_notes: DataTypes.TEXT,
    admin_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    is_anonymous: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};
