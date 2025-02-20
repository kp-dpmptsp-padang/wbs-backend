const { validationResult } = require("express-validator");
const { Report, Report_File, User } = require("../models");
const { generateUniqueCode } = require("../utils/unique_code");
const { successResponse, errorResponse } = require("../utils/response");

const createReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, violation, location, date, actors, detail, is_anonymous } =
      req.body;
    const evidenceFiles = req.files;

    let userId = null;
    let unique_code = null;

    if (is_anonymous === true || is_anonymous === "true") {
      unique_code = generateUniqueCode();
    } else {
      userId = req.user.id;
    }

    const newReport = await Report.create({
      title,
      violation,
      location,
      date,
      actors,
      detail,
      is_anonymous,
      userId,
      status: "menunggu-verifikasi",
      unique_code,
    });

    if (evidenceFiles) {
      for (const file of evidenceFiles) {
        await Report_File.create({
          report_id: newReport.id,
          file_path: file.path,
          file_type: "evidence",
        });
      }
    }

    const responseData = {
      id: newReport.id,
      title: newReport.title,
      status: newReport.status,
      unique_code: newReport.unique_code,
    };

    return successResponse(res, "Report created successfully", responseData);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error");
  }
};

const getReportHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const reports = await Report.findAll({
      where: { userId },
      include: [
        {
          model: Report_File,
          as: "files",
          attributes: ["id", "file_path", "file_type"],
        },
        {
          model: User,
          as: "admin",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const responseData = reports.map((report) => ({
      id: report.id,
      title: report.title,
      violation: report.violation,
      location: report.location,
      date: report.date,
      actors: report.actors,
      detail: report.detail,
      status: report.status,
      rejection_reason: report.rejection_reason,
      admin_notes: report.admin_notes,
      verified_at: report.verified_at,
      completed_at: report.completed_at,
      created_at: report.createdAt,
      is_anonymous: report.is_anonymous,
      files: report.files,
      processor: report.admin
        ? { id: report.admin.id, name: report.admin.name }
        : null,
    }));

    return successResponse(
      res,
      "Report history fetched successfully",
      responseData
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error");
  }
};

const getReportDetail = async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await Report.findOne({
      where: { id: reportId },
      include: [
        {
          model: Report_File,
          as: "files",
          attributes: ["id", "file_path", "file_type"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "admin",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }

    const responseData = {
      id: report.id,
      title: report.title,
      violation: report.violation,
      location: report.location,
      date: report.date,
      actors: report.actors,
      detail: report.detail,
      status: report.status,
      rejection_reason: report.rejection_reason,
      admin_notes: report.admin_notes,
      verified_at: report.verified_at,
      completed_at: report.completed_at,
      created_at: report.createdAt,
      is_anonymous: report.is_anonymous,
      files: report.files,
      reporter: report.user
        ? { id: report.user.id, name: report.user.name }
        : null,
      processor: report.admin
        ? { id: report.admin.id, name: report.admin.name }
        : null,
    };

    return successResponse(
      res,
      "Report details fetched successfully",
      responseData
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error");
  }
};

const getAnonymousReportDetail = async (req, res) => {
  try {
    const uniqueCode = req.params.unique_code;

    const report = await Report.findOne({
      where: { unique_code: uniqueCode },
      include: [
        {
          model: Report_File,
          as: "files",
          attributes: ["id", "file_path", "file_type"],
        },
        {
          model: User,
          as: "admin",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }

    const responseData = {
      id: report.id,
      title: report.title,
      violation: report.violation,
      location: report.location,
      date: report.date,
      actors: report.actors,
      detail: report.detail,
      status: report.status,
      rejection_reason: report.rejection_reason,
      admin_notes: report.admin_notes,
      verified_at: report.verified_at,
      completed_at: report.completed_at,
      created_at: report.createdAt,
      is_anonymous: report.is_anonymous,
      files: report.files,
      processor: report.admin
        ? { id: report.admin.id, name: report.admin.name }
        : null,
    };

    return successResponse(
      res,
      "Anonymous report details fetched successfully",
      responseData
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error");
  }
};

module.exports = {
  createReport,
  getReportDetail,
  getReportHistory,
  getAnonymousReportDetail,
};
