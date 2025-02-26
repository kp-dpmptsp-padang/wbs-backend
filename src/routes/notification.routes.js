const express = require("express");
const router = express.Router();
const {
  getNotification,
  readAllNotification,
  markNotificationAsRead,
} = require("../controllers/notification.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, getNotification);
router.put("/read-all", auth, readAllNotification);
router.put("/:id/read", auth, markNotificationAsRead);

module.exports = router;
