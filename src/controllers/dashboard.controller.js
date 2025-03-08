const { User, Report, Notification } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

/**
 * Get dashboard data for regular users
 */
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's active reports
    const totalReports = await Report.count({ where: { userId } });
    const waitingVerification = await Report.count({ 
      where: { 
        userId,
        status: "menunggu-verifikasi" 
      } 
    });
    const inProcess = await Report.count({ 
      where: { 
        userId,
        status: "diproses" 
      } 
    });
    const completed = await Report.count({ 
      where: { 
        userId,
        status: "selesai" 
      } 
    });

    // Get latest activities (both reports and notifications)
    const latestReports = await Report.findAll({
      where: { userId },
      attributes: ["id", "title", "status", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: 5
    });

    // Get unread messages count
    const unreadMessages = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });

    // Format activities
    const latestActivities = latestReports.map(report => ({
      type: "report",
      report_id: report.id,
      message: `Your report "${report.title}" is now ${report.status}`,
      timestamp: report.createdAt
    }));

    return successResponse(res, "User dashboard data retrieved successfully", {
      active_reports: {
        total: totalReports,
        waiting_verification: waitingVerification,
        in_process: inProcess,
        completed: completed
      },
      latest_activities: latestActivities,
      unread_messages: unreadMessages
    });
  } catch (error) {
    console.error("Error fetching user dashboard:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

/**
 * Get dashboard data for admins
 */
const getAdminDashboard = async (req, res) => {
  try {
    // Get reports statistics
    const pendingVerification = await Report.count({ 
      where: { status: "menunggu-verifikasi" } 
    });
    
    const inProcess = await Report.count({ 
      where: { status: "diproses" } 
    });

    // Get date for this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const completedThisMonth = await Report.count({
      where: {
        status: "selesai",
        updatedAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    const rejectedThisMonth = await Report.count({
      where: {
        status: "ditolak",
        updatedAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Reports by status
    const reportsByStatus = [
      { status: "menunggu-verifikasi", count: pendingVerification },
      { status: "diproses", count: inProcess },
      { status: "ditolak", count: await Report.count({ where: { status: "ditolak" } }) },
      { status: "selesai", count: await Report.count({ where: { status: "selesai" } }) }
    ];

    // Recent reports
    const recentReports = await Report.findAll({
      attributes: ["id", "title", "status", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    return successResponse(res, "Admin dashboard data retrieved successfully", {
      stats: {
        pending_verification: pendingVerification,
        in_process: inProcess,
        completed_this_month: completedThisMonth,
        rejected_this_month: rejectedThisMonth
      },
      reports_by_status: reportsByStatus,
      recent_reports: recentReports
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

/**
 * Get dashboard data for super admins
 */
const getSuperAdminDashboard = async (req, res) => {
  try {
    // Get system-wide statistics
    const totalUsers = await User.count({ where: { role: "user" } });
    const totalReports = await Report.count();
    
    // Calculate completion rate
    const completedReports = await Report.count({ where: { status: "selesai" } });
    const completionRate = totalReports > 0 ? (completedReports / totalReports) * 100 : 0;

    // Calculate average process time (in days)
    const processedReports = await Report.findAll({
      where: {
        status: "selesai",
        createdAt: { [Op.ne]: null },
        updatedAt: { [Op.ne]: null }
      },
      attributes: [
        [sequelize.fn('DATEDIFF', sequelize.col('updatedAt'), sequelize.col('createdAt')), 'processDays']
      ],
      raw: true
    });

    let averageProcessTime = 0;
    if (processedReports.length > 0) {
      const totalDays = processedReports.reduce((sum, report) => sum + parseInt(report.processDays || 0), 0);
      averageProcessTime = totalDays / processedReports.length;
    }

    // Get admin performance
    const adminPerformance = await Report.findAll({
      where: {
        adminId: { [Op.ne]: null },
        status: "selesai"
      },
      attributes: [
        'adminId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'reportsHandled']
      ],
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['name']
        }
      ],
      group: ['adminId'],
      raw: true,
      nest: true
    });

    // Get monthly report statistics
    const currentYear = new Date().getFullYear();
    const monthlyReports = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);
      
      const count = await Report.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      
      monthlyReports.push({
        month: monthNames[month],
        reports_count: count
      });
    }

    return successResponse(res, "Super admin dashboard data retrieved successfully", {
      system_stats: {
        total_users: totalUsers,
        total_reports: totalReports,
        completion_rate: parseFloat(completionRate.toFixed(2)),
        average_process_time: `${averageProcessTime.toFixed(1)} days`
      },
      admin_performance: adminPerformance.map(admin => ({
        admin_id: admin.adminId,
        name: admin.admin ? admin.admin.name : 'Unknown',
        reports_handled: parseInt(admin.reportsHandled)
      })),
      monthly_reports: monthlyReports
    });
  } catch (error) {
    console.error("Error fetching super admin dashboard:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

module.exports = {
  getUserDashboard,
  getAdminDashboard,
  getSuperAdminDashboard
};