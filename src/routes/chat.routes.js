const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const authenticate = require("../middlewares/auth.middleware");
const { validateChatMessage } = require("../validators/chat.validator");

// Catatan: auth middleware sudah diterapkan di index.js untuk semua rute /reports

// Mendapatkan riwayat chat untuk suatu laporan
router.get("/:report_id/chats", authenticate, chatController.getReportChats);

// Mendapatkan riwayat chat untuk suatu laporan anonim
router.get(
  "/:unique_code/chats/anonymous",
  authenticate,
  chatController.getReportChatsAnonymous
);

// Mengirim pesan chat baru
router.post(
  "/:report_id/chats",
  authenticate,
  validateChatMessage,
  chatController.sendChatMessage
);

// Mengirim pesan chat baru untuk laporan anonim
router.post(
  "/:unique_code/chats/anonymous",
  authenticate,
  validateChatMessage,
  chatController.sendChatMessageAnonymous
);

module.exports = router;
