const router = require('express').Router();
const authRoutes = require('./auth.routes');
const reportRoutes = require('./report.routes');
const chatRoutes = require('./chat.routes');
const adminRoutes = require('./admin.routes');
const dashboardRoutes = require('./dashboard.routes');
const notificationRoutes = require('./notification.routes');

const auth = require('../middlewares/auth.middleware');
// const role = require('../middlewares/role.middleware');

// Public routes
router.use('/auth', authRoutes);

// Protected routes
// router.use('/reports', auth, reportRoutes);
// router.use('/chats', auth, chatRoutes);
// router.use('/notifications', auth, notificationRoutes);

// Admin routes
// router.use('/admin', auth, role(['super-admin', 'admin-verifikator', 'admin-prosesor']), adminRoutes);
// router.use('/dashboard', auth, dashboardRoutes);

module.exports = router;