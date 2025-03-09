const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const authenticate = require("../middlewares/auth.middleware");
const { validateChatMessage } = require("../validators/chat.validator");

// Catatan: auth middleware sudah diterapkan di index.js untuk semua rute /reports

// Mendapatkan riwayat chat untuk suatu laporan
router.get(
  "/:report_id/chats",
  authenticate,
  chatController.getReportChats
);

// Mengirim pesan chat baru
router.post(
  "/:report_id/chats",
  authenticate,
  validateChatMessage,
  chatController.sendChatMessage
);

module.exports = router;