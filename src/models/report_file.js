"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Report_File extends Model {
    static associate(models) {
      Report_File.belongsTo(models.Report, {
        foreignKey: "report_id",
        as: "report",
      });
    }
  }
  Report_File.init(
    {
      report_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_type: {
        type: DataTypes.ENUM("evidence", "handling_proof"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Report_File",
    }
  );
  return Report_File;
};
