const express = require("express");
const router = express.Router();
const {
  getNotification,
  readAllNotification,
  markNotificationAsRead,
} = require("../controllers/notification.controller");

// Catatan: auth middleware sudah diterapkan pada /notifications di index.js
// sehingga tidak perlu ditambahkan lagi di setiap route

// Mendapatkan daftar notifikasi pengguna
router.get(
  "/", 
  getNotification
);

// Menandai semua notifikasi sebagai telah dibaca
router.put(
  "/read-all", 
  readAllNotification
);

// Menandai satu notifikasi sebagai telah dibaca
router.put(
  "/:id/read", 
  markNotificationAsRead
);

module.exports = router;