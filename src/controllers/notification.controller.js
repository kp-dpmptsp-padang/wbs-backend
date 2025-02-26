const { Notification } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

const getNotification = async (req, res) => {
  const userId = req.user.id;
  const { is_read, page = 1, per_page = 10 } = req.query;
  const offset = (page - 1) * per_page;
  const where = { user_id: userId };

  if (is_read !== undefined) {
    where.is_read = is_read === "true";
  }

  try {
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(per_page, 10),
      offset,
    });

    const unreadCount = await Notification.count({
      where: { user_id: userId, is_read: false },
    });

    const totalPages = Math.ceil(count / per_page);

    const response = {
      data: notifications,
      meta: {
        unread_count: unreadCount,
        current_page: parseInt(page, 10),
        total_pages: totalPages,
      },
    };

    return successResponse(res, "Notification list", response);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const readAllNotification = async (req, res) => {
  const userId = req.user.id;
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );

    return successResponse(res, "All notifications marked as read");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const markNotificationAsRead = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const notification = await Notification.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      return errorResponse(res, "Notification not found", 404);
    }

    await notification.update({ is_read: true });

    return successResponse(res, "Notification marked as read");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getNotification,
  readAllNotification,
  markNotificationAsRead,
};
