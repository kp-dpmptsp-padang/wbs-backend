const { validationResult } = require("express-validator");
const { Report, Report_File, User, Notification } = require("../models");
const { generateUniqueCode } = require("../utils/unique_code");
const {
  successResponse,
  errorResponse,
  successCreatedResponse,
} = require("../utils/response");
const moment = require("moment");

// Cuplikan kode untuk report.controller.js
// Fokus pada fungsi createReport untuk menggunakan fileInfo

const createReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, violation, location, date, actors, detail, is_anonymous } =
      req.body;

    // Dapatkan informasi file dari request (diisi oleh middleware upload)
    const fileInfo = req.fileInfo;

    // Validasi apakah file bukti disertakan
    if (!fileInfo) {
      return errorResponse(res, "Bukti laporan harus disertakan", 400);
    }

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

    // Simpan info file ke dalam tabel Report_File
    await Report_File.create({
      report_id: newReport.id,
      file_path: fileInfo.path,
      file_type: "evidence", // Pastikan file_type sesuai dengan enum di model
    });

    const responseData = {
      id: newReport.id,
      title: newReport.title,
      status: newReport.status,
      unique_code: newReport.unique_code,
    };

    // Notifikasi untuk admin (kode tidak berubah)
    const adminUsers = await User.findAll({
      where: { role: "admin" },
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
    console.error("Error creating report:", error);
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
      where: { id: adminId, role: "admin" },
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

    if (report.userId) {
      await Notification.create({
        user_id: report.userId,
        message: `Laporan Anda dengan judul "${report.title}" sedang diproses`,
        is_read: false,
      });
    }

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
      where: { id: adminId, role: "admin" },
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

    if (report.userId) {
      await Notification.create({
        user_id: report.userId,
        message: `Laporan Anda dengan judul "${report.title}" telah ditolak dengan alasan: ${rejection_reason}`,
        is_read: false,
      });
    }

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

// Fungsi completeReport yang diperbarui - perbaikan pengecekan role

const completeReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const adminId = req.user.id;
    const { admin_notes } = req.body;

    // File handling proof bersifat opsional
    const fileInfo = req.fileInfo;

    // Verifikasi bahwa user adalah admin
    // Pengecekan role admin dilakukan di middleware level route
    // Jadi di sini kita hanya perlu memastikan bahwa jenis admin tersebut adalah admin-prosesor
    // Catatan: Jika tidak ada jenis admin-prosesor, Anda bisa menghapus pengecekan ini
    // dan menggantinya dengan pengecekan sederhana pada role

    // Cek apakah user adalah admin-prosesor (jika ada jenis admin spesifik)
    // Jika tidak ada jenis admin spesifik, gunakan kode di bawah yang dikomentari
    /*
    const adminUser = await User.findOne({
      where: { id: adminId, role: "admin-prosesor" },
    });

    if (!adminUser) {
      return errorResponse(res, "Unauthorized", 403);
    }
    */

    // Alternatif jika tidak ada jenis admin spesifik:
    if (req.user.role !== "admin" && req.user.role !== "super-admin") {
      return errorResponse(
        res,
        "Unauthorized: Hanya admin yang dapat menyelesaikan laporan",
        403
      );
    }

    const report = await Report.findOne({
      where: { id: reportId },
    });

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }

    if (report.status !== "diproses") {
      return errorResponse(
        res,
        "Laporan tidak dapat diselesaikan. Status harus 'diproses'",
        400
      );
    }

    report.status = "selesai";
    report.adminId = adminId;
    report.admin_notes = admin_notes;
    report.completed_at = new Date();
    await report.save();

    // Jika ada file bukti penanganan, simpan ke database
    if (fileInfo) {
      await Report_File.create({
        report_id: report.id,
        file_path: fileInfo.path,
        file_type: "handling_proof",
      });
    }

    // Kirim notifikasi ke pelapor jika bukan laporan anonim
    if (report.userId) {
      await Notification.create({
        user_id: report.userId,
        message: `Laporan Anda dengan judul "${report.title}" telah diselesaikan`,
        is_read: false,
      });
    }

    const responseData = {
      id: report.id,
      status: report.status,
    };

    return successResponse(res, "Laporan telah diselesaikan", responseData);
  } catch (error) {
    console.error("Error completing report:", error);
    return errorResponse(res, "Server error", 500);
  }
};

// Tambahkan fungsi berikut ke src/controllers/report.controller.js

/**
 * Mendapatkan semua file yang terkait dengan laporan
 */
const getReportFiles = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;

    // Cari laporan
    const report = await Report.findByPk(reportId);

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }

    // Cek akses: pengguna harus pemilik laporan atau admin
    const isOwner = report.userId === userId;
    const isAdmin = ["admin", "super-admin"].includes(req.user.role);

    if (!isOwner && !isAdmin && !report.is_anonymous) {
      return errorResponse(res, "Unauthorized access to report files", 403);
    }

    // Dapatkan semua file terkait laporan
    const files = await Report_File.findAll({
      where: { report_id: reportId },
    });

    // Tambahkan URL untuk setiap file
    const filesWithUrls = files.map((file) => {
      const uploadUtils = require("../utils/upload");
      return {
        id: file.id,
        report_id: file.report_id,
        file_path: file.file_path,
        file_type: file.file_type,
        created_at: file.createdAt,
        url: uploadUtils.getFileUrl(file.file_path),
      };
    });

    return successResponse(res, "Report files retrieved successfully", {
      files: filesWithUrls,
    });
  } catch (error) {
    console.error("Error fetching report files:", error);
    return errorResponse(res, "Server error");
  }
};

/**
 * Mengunduh file spesifik
 */
const downloadFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user.id;

    // Cari file
    const file = await Report_File.findByPk(fileId, {
      include: [
        {
          model: Report,
          as: "report",
        },
      ],
    });

    if (!file) {
      return errorResponse(res, "File not found", 404);
    }

    // Cek akses: pengguna harus pemilik laporan atau admin
    const report = file.report;
    const isOwner = report.userId === userId;
    const isAdmin = ["admin", "super-admin"].includes(req.user.role);

    if (!isOwner && !isAdmin && !report.is_anonymous) {
      return errorResponse(res, "Unauthorized access to file", 403);
    }

    // Periksa apakah file ada di sistem
    const fs = require("fs");
    const path = require("path");

    const filePath = path.resolve(file.file_path);

    if (!fs.existsSync(filePath)) {
      return errorResponse(res, "File not found on server", 404);
    }

    // Tentukan nama file untuk download
    const originalFilename = path.basename(filePath);

    // Kirim file sebagai response
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${originalFilename}`
    );
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error downloading file:", error);
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
  getReportFiles,
  downloadFile,
};
