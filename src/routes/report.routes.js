const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const reportValidator = require("../validators/report.validator");
const { uploadEvidence, uploadHandlingProof } = require("../middlewares/upload.middleware");
const authorize = require("../middlewares/role.middleware");

// Catatan: auth middleware sudah diterapkan pada /reports di index.js
// sehingga tidak perlu ditambahkan lagi di setiap route

// ==== Rute untuk semua pengguna ====

// Membuat laporan baru (user biasa)
router.post(
  "/",
  uploadEvidence,
  reportValidator.createReportValidator,
  reportController.createReport
);

// Mendapatkan riwayat laporan user
router.get(
  "/history", 
  reportController.getReportHistory
);

// Mendapatkan detail laporan berdasarkan ID
router.get(
  "/:id",
  reportController.getReportDetail
);

// Mendapatkan file laporan
router.get(
  "/:id/files",
  reportController.getReportFiles
);

// Mengunduh file spesifik
router.get(
  "/files/:fileId",
  reportController.downloadFile
);

// Mendapatkan laporan anonim berdasarkan kode unik
// Ini adalah rute publik, tidak memerlukan autentikasi
router.get(
  "/anonymous/:unique_code",
  reportController.getAnonymousReportDetail
);

// ==== Rute untuk admin ====

// Memproses laporan (hanya admin verifikator)
router.put(
  "/:id/process",
  authorize(["admin", "super-admin"]),
  reportController.processReport
);

// Menolak laporan (hanya admin verifikator)
router.put(
  "/:id/reject",
  authorize(["admin", "super-admin"]),
  reportController.rejectReport
);

// Menyelesaikan laporan (hanya admin prosesor)
// Catatan: Kita hanya menggunakan authorize untuk role, 
// pengecekan spesifik admin-prosesor tetap di controller
router.put(
  "/:id/complete",
  authorize(["admin", "super-admin"]),
  uploadHandlingProof,
  reportController.completeReport
);

module.exports = router;