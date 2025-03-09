const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authorize = require("../middlewares/role.middleware");
const { validateAdmin } = require("../validators/admin.validator");

// Catatan: auth middleware dan basic admin authorization sudah diterapkan pada /admin di index.js
// Pada routes ini kita hanya perlu authorize untuk role super-admin jika diperlukan

// ==== Manajemen Admin (hanya super-admin) ====

// Mendapatkan daftar admin
router.get(
  "/", 
  authorize(["super-admin"]), 
  adminController.getAllAdmins
);

// Membuat admin baru
router.post(
  "/", 
  authorize(["super-admin"]), 
  validateAdmin, 
  adminController.createAdmin
);

// Mengupdate admin yang ada
router.put(
  "/:id", 
  authorize(["super-admin"]), 
  validateAdmin, 
  adminController.updateAdmin
);

// Menghapus admin
router.delete(
  "/:id", 
  authorize(["super-admin"]), 
  adminController.deleteAdmin
);

// ==== Manajemen Laporan (admin & super-admin) ====

// Mendapatkan semua laporan
router.get(
  "/reports", 
  adminController.getAllReports
);

// Mendapatkan detail laporan
router.get(
  "/reports/:id", 
  adminController.getReportById
);

// ==== Dashboard Statistik ====

// Mendapatkan statistik overview
router.get(
  "/stats/overview", 
  adminController.getOverviewStats
);

// Mendapatkan statistik laporan
router.get(
  "/stats/reports", 
  adminController.getReportStats
);

module.exports = router;