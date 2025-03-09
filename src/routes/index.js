const router = require("express").Router();
const authRoutes = require("./auth.routes");
const reportRoutes = require("./report.routes");
const notificationRoutes = require("./notification.routes");
const adminRoutes = require("./admin.routes");
const dashboardRoutes = require("./dashboard.routes");
const chatRoutes = require("./chat.routes");

// Middleware
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// Public routes (tidak memerlukan autentikasi)
router.use("/auth", authRoutes);

// User routes (dilindungi oleh authentication)
router.use("/reports", auth, reportRoutes);
router.use("/notifications", auth, notificationRoutes);
router.use("/reports", auth, chatRoutes);

// Admin routes (dilindungi oleh authentication dan role authorization)
router.use(
  "/admin", 
  auth, 
  authorize(["admin", "super-admin"]), 
  adminRoutes
);

// Dashboard routes (masing-masing route sudah memiliki middleware sendiri)
router.use("/dashboard", dashboardRoutes);

// 404 handler untuk rute yang tidak terdefinisi
router.use("*", (req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

module.exports = router;