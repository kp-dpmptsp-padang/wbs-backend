const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const { validateAdmin } = require("../validators/admin.validator");

// Routes accessible by super-admin only
router.get("/", authenticate, authorize(["super-admin"]), adminController.getAllAdmins);
router.post("/", authenticate, authorize(["super-admin"]), validateAdmin, adminController.createAdmin);
router.put("/:id", authenticate, authorize(["super-admin"]), validateAdmin, adminController.updateAdmin);
router.delete("/:id", authenticate, authorize(["super-admin"]), adminController.deleteAdmin);

// Routes for report management (accessible by admin and super-admin)
router.get("/reports", authenticate, authorize(["admin", "super-admin"]), adminController.getAllReports);
router.get("/reports/:id", authenticate, authorize(["admin", "super-admin"]), adminController.getReportById);

// Routes for admin dashboard (statistics)
router.get("/stats/overview", authenticate, authorize(["admin", "super-admin"]), adminController.getOverviewStats);
router.get("/stats/reports", authenticate, authorize(["admin", "super-admin"]), adminController.getReportStats);

module.exports = router;