const { User, Report, Notification } = require("../models");
const { hashPassword } = require("../utils/password");
const { successResponse, errorResponse, successCreatedResponse } = require("../utils/response");
const { Op } = require("sequelize");

/**
 * Get all admin users (super-admin only)
 */
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: {
        role: {
          [Op.in]: ["admin"]
        }
      },
      attributes: ["id", "name", "email", "role", "createdAt"]
    });

    return successResponse(res, "Admin list retrieved successfully", { data: admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

/**
 * Create a new admin user (super-admin only)
 */
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, "Email already in use", 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new admin user
    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin" // Always create as admin, super-admin is special
    });

    return successCreatedResponse(
      res,
      "Admin created successfully",
      {
        data: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role
        }
      }
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

/**
 * Update an existing admin (super-admin only)
 */
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Find the admin to update
    const admin = await User.findByPk(id);
    if (!admin) {
      return errorResponse(res, "Admin not found", 404);
    }

    if (admin.role === "super-admin") {
      return errorResponse(res, "Cannot modify super-admin accounts", 403);
    }

    // If email is changing, check for duplicates
    if (email !== admin.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return errorResponse(res, "Email already in use", 400);
      }
    }

    // Update the admin
    const updateData = {
      name,
      email
    };

    // Only update password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }

    await admin.update(updateData);

    return successResponse(
      res,
      "Admin updated successfully",
      {
        data: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    );
  } catch (error) {
    console.error("Error updating admin:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

/**
 * Delete an admin (super-admin only)
 */
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the admin
    const admin = await User.findByPk(id);
    if (!admin) {
      return errorResponse(res, "Admin not found", 404);
    }

    // Prevent deletion of super-admin
    if (admin.role === "super-admin") {
      return errorResponse(res, "Cannot delete super-admin accounts", 403);
    }

    // Delete the admin
    await admin.destroy();

    return successResponse(res, "Admin deleted successfully");
  } catch (error) {
    console.error("Error deleting admin:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

/**
 * Get all reports (for admin dashboard)
 */
const getAllReports = async (req, res) => {
  try {
    const { status, page = 1, per_page = 10 } = req.query;
    const offset = (page - 1) * per_page;
    const where = {};

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Fetch reports with pagination
    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(per_page, 10),
      offset
    });

    const totalPages = Math.ceil(count / per_page);

    return successResponse(res, "Reports retrieved successfully", {
      data: reports,
      meta: {
        current_page: parseInt(page, 10),
        last_page: totalPages,
        per_page: parseInt(per_page, 10),
        total: count
      }
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

/**
 * Get specific report by ID
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"]
        },
        {
          model: User,
          as: "admin",
          attributes: ["id", "name"]
        }
      ]
    });

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }

    return successResponse(res, "Report retrieved successfully", { data: report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

/**
 * Get overview statistics for admin dashboard
 */
const getOverviewStats = async (req, res) => {
  try {
    // Count reports by status
    const totalReports = await Report.count();
    const completedReports = await Report.count({ where: { status: "selesai" } });
    const processingReports = await Report.count({ where: { status: "diproses" } });
    const pendingReports = await Report.count({ where: { status: "menunggu-verifikasi" } });
    const rejectedReports = await Report.count({ where: { status: "ditolak" } });

    return successResponse(res, "Overview statistics retrieved successfully", {
      data: {
        total_reports: totalReports,
        completed_reports: completedReports,
        processing_reports: processingReports,
        pending_reports: pendingReports,
        rejected_reports: rejectedReports
      }
    });
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

/**
 * Get detailed report statistics (for charts, etc.)
 */
const getReportStats = async (req, res) => {
  try {
    // Get reports by status
    const reportsByStatus = [
      { status: "menunggu-verifikasi", count: await Report.count({ where: { status: "menunggu-verifikasi" } }) },
      { status: "diproses", count: await Report.count({ where: { status: "diproses" } }) },
      { status: "ditolak", count: await Report.count({ where: { status: "ditolak" } }) },
      { status: "selesai", count: await Report.count({ where: { status: "selesai" } }) }
    ];

    // Recent reports for dashboard
    const recentReports = await Report.findAll({
      attributes: ["id", "title", "status", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: 5
    });

    return successResponse(res, "Report statistics retrieved successfully", {
      data: {
        reports_by_status: reportsByStatus,
        recent_reports: recentReports
      }
    });
  } catch (error) {
    console.error("Error fetching report stats:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

module.exports = {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllReports,
  getReportById,
  getOverviewStats,
  getReportStats
};