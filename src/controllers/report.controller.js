const { validationResult } = require("express-validator");
const { Report, Report_File, User, Notification } = require("../models");
const { generateUniqueCode } = require("../utils/unique_code");
const {
  successResponse,
  errorResponse,
  successCreatedResponse,
} = require("../utils/response");
const moment = require("moment");

const createReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, violation, location, date, actors, detail, is_anonymous } =
      req.body;
    const evidence_files = req.file;

    let userId = null;
    let unique_code = null;

    if (is_anonymous === true || is_anonymous === "true") {
      unique_code = generateUniqueCode();
    } else {
      userId = req.user.id;
    }

    const formattedDate = moment(date, "DD-MM-YYYY").format("YYYY-MM-DD");

    const newReport = await Report.create({
      title,
      violation,
      location,
      date: formattedDate,
      actors,
      detail,
      is_anonymous,
      userId,
      status: "menunggu-verifikasi",
      unique_code,
    });

    if (evidence_files) {
      await Report_File.create({
        report_id: newReport.id,
        file_path: evidence_files.path,
        file_type: "evidence",
      });
    }

    const responseData = {
      id: newReport.id,
      title: newReport.title,
      status: newReport.status,
      unique_code: newReport.unique_code,
    };

    const adminUsers = await User.findAll({
      where: { role: "admin-verifikator" },
    });

    if (adminUsers && adminUsers.length > 0) {
      const notifications = adminUsers.map((adminUser) => ({
        user_id: adminUser.id,
        message: `Laporan tentang ${title} masuk dari ${
          is_anonymous ? "Anonymous" : req.user.name
        }`,
        is_read: false,
      }));

      await Notification.bulkCreate(notifications);
    }

    return successCreatedResponse(
      res,
      "Report created successfully",
      responseData
    );
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

const processReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const adminId = req.user.id;

    const adminUser = await User.findOne({
      where: { id: adminId, role: "admin-verifikator" },
    });

    if (!adminUser) {
      return errorResponse(res, "Unauthorized", 403);
    }

    const report = await Report.findOne({
      where: { id: reportId },
    });

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }

    if (report.status !== "menunggu-verifikasi") {
      return errorResponse(res, "Report cannot be processed", 400);
    }

    report.status = "diproses";
    report.adminId = adminId;
    await report.save();

    const responseData = {
      id: report.id,
      status: report.status,
    };

    return successResponse(res, "Report is now being processed", responseData);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error");
  }
};

const rejectReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const adminId = req.user.id;
    const { rejection_reason } = req.body;

    const adminUser = await User.findOne({
      where: { id: adminId, role: "admin-verifikator" },
    });

    if (!adminUser) {
      return errorResponse(res, "Unauthorized", 403);
    }

    const report = await Report.findOne({
      where: { id: reportId },
    });

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }

    if (report.status !== "menunggu-verifikasi") {
      return errorResponse(res, "Report cannot be rejected", 400);
    }

    report.status = "ditolak";
    report.adminId = adminId;
    report.rejection_reason = rejection_reason;
    await report.save();

    const responseData = {
      id: report.id,
      status: report.status,
    };

    return successResponse(res, "Report has been rejected", responseData);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error");
  }
};

const completeReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const adminId = req.user.id;
    const { admin_notes } = req.body;
    const handling_proof = req.file;

    const adminUser = await User.findOne({
      where: { id: adminId, role: "admin-prosesor" },
    });

    if (!adminUser) {
      return errorResponse(res, "Unauthorized", 403);
    }

    const report = await Report.findOne({
      where: { id: reportId },
    });

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }

    if (report.status !== "diproses") {
      return errorResponse(res, "Report cannot be completed", 400);
    }

    report.status = "selesai";
    report.adminId = adminId;
    report.admin_notes = admin_notes;
    report.completed_at = new Date();
    await report.save();

    if (handling_proof) {
      await Report_File.create({
        report_id: report.id,
        file_path: handling_proof.path,
        file_type: "handling_proof",
      });
    }

    const responseData = {
      id: report.id,
      status: report.status,
    };

    return successResponse(res, "Report has been completed", responseData);
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
  processReport,
  rejectReport,
  completeReport,
};
