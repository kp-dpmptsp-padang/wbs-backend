const { Chat, User, Report, Notification } = require("../models");
const { successResponse, errorResponse, successCreatedResponse } = require("../utils/response");

/**
 * Mendapatkan riwayat chat untuk suatu laporan
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getReportChats = async (req, res) => {
  try {
    const reportId = req.params.report_id;
    const userId = req.user.id;

    // Cari laporan untuk verifikasi akses
    const report = await Report.findByPk(reportId);
    
    if (!report) {
      return errorResponse(res, "Laporan tidak ditemukan", 404);
    }

    // Periksa akses: pengguna harus pemilik laporan atau admin
    const isOwner = report.userId === userId;
    const isAdmin = ["admin", "super-admin"].includes(req.user.role);
    
    if (!isOwner && !isAdmin && !report.is_anonymous) {
      return errorResponse(res, "Anda tidak memiliki akses ke chat laporan ini", 403);
    }

    // Dapatkan riwayat chat dengan informasi user
    const chats = await Chat.findAll({
      where: { report_id: reportId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "role"]
        }
      ],
      order: [["createdAt", "ASC"]]
    });

    // Format hasil sesuai API spec
    const formattedChats = chats.map(chat => ({
      id: chat.id,
      message: chat.message,
      created_at: chat.createdAt,
      user: chat.user ? {
        id: chat.user.id,
        name: chat.user.name,
        role: chat.user.role
      } : null
    }));

    return successResponse(res, "Chat berhasil diambil", { data: formattedChats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return errorResponse(res, "Server error", 500);
  }
};

/**
 * Mengirim pesan chat baru
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const sendChatMessage = async (req, res) => {
  try {
    const reportId = req.params.report_id;
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return errorResponse(res, "Pesan tidak boleh kosong", 400);
    }

    // Cari laporan untuk verifikasi akses
    const report = await Report.findByPk(reportId);
    
    if (!report) {
      return errorResponse(res, "Laporan tidak ditemukan", 404);
    }

    // Periksa akses: pengguna harus pemilik laporan atau admin
    const isOwner = report.userId === userId;
    const isAdmin = ["admin", "super-admin"].includes(req.user.role);
    
    if (!isOwner && !isAdmin) {
      return errorResponse(res, "Anda tidak memiliki akses untuk mengirim pesan ke laporan ini", 403);
    }

    // Buat pesan chat baru
    const newChat = await Chat.create({
      report_id: reportId,
      user_id: userId,
      message: message
    });

    // Ambil data user untuk response
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "role"]
    });

    // Kirim notifikasi ke penerima pesan
    let recipientId;
    
    if (isAdmin) {
      // Jika pengirim adalah admin, notifikasi ke pelapor
      recipientId = report.userId;
    } else {
      // Jika pengirim adalah pelapor, notifikasi ke admin yang menangani laporan
      recipientId = report.adminId;
    }

    // Hanya kirim notifikasi jika ada penerima yang valid
    if (recipientId) {
      await Notification.create({
        user_id: recipientId,
        message: `Pesan baru dari ${user.name} terkait laporan "${report.title}"`,
        is_read: false
      });
    }

    // Format response sesuai API spec
    const responseData = {
      id: newChat.id,
      message: newChat.message,
      created_at: newChat.createdAt,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    };

    return successCreatedResponse(res, "Pesan berhasil dikirim", { data: responseData });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return errorResponse(res, "Server error", 500);
  }
};

module.exports = {
  getReportChats,
  sendChatMessage
};