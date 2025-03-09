const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// Middleware auth dan authorize dipasang di setiap endpoint
// untuk memberikan kontrol akses yang spesifik

// User dashboard - hanya untuk pengguna biasa
router.get(
  "/user", 
  authenticate, 
  authorize(["user"]), 
  dashboardController.getUserDashboard
);

// Admin dashboard - hanya untuk admin
router.get(
  "/admin", 
  authenticate, 
  authorize(["admin"]), 
  dashboardController.getAdminDashboard
);

// Super admin dashboard - hanya untuk super admin
router.get(
  "/super-admin", 
  authenticate, 
  authorize(["super-admin"]), 
  dashboardController.getSuperAdminDashboard
);

module.exports = router;