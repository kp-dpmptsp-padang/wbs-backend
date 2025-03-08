const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// User dashboard
router.get("/user", authenticate, authorize(["user"]), dashboardController.getUserDashboard);

// Admin dashboard
router.get("/admin", authenticate, authorize(["admin"]), dashboardController.getAdminDashboard);

// Super admin dashboard
router.get("/super-admin", authenticate, authorize(["super-admin"]), dashboardController.getSuperAdminDashboard);

module.exports = router;