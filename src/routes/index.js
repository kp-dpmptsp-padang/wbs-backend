const router = require("express").Router();
const authRoutes = require("./auth.routes");
const reportRoutes = require("./report.routes");
const notificationRoutes = require("./notification.routes");
const adminRoutes = require("./admin.routes");
const dashboardRoutes = require("./dashboard.routes");

const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// Public routes
router.use("/auth", authRoutes);

// User routes (protected by authentication)
router.use("/reports", auth, reportRoutes);
router.use("/notifications", auth, notificationRoutes);

// Admin routes (protected by authentication and role authorization)
router.use(
  "/admin", 
  auth, 
  authorize(["admin", "super-admin"]), 
  adminRoutes
);

// Dashboard routes
router.use("/dashboard", dashboardRoutes);

// 404 handler for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

module.exports = router;