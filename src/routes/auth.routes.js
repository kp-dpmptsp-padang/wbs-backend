const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  validateRegister,
  validateLogin,
} = require("../validators/auth.validator");

// Register route
router.post("/register", validateRegister, authController.register);

// Login route
router.post("/login", validateLogin, authController.login);

// Forgot password route
router.post("/forgot-password", authController.forgotPassword);

// Update profile route
router.put("/profile", authController.updateProfile);

// Update password route
router.put("/password", authController.updatePassword);

module.exports = router;
