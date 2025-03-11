const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  validateRegister,
  validateLogin,
} = require("../validators/auth.validator");
const auth = require("../middlewares/auth.middleware");

// ==== Rute publik (tidak memerlukan autentikasi) ====

// Registrasi pengguna
router.post("/register", validateRegister, authController.register);

// Login
router.post("/login", validateLogin, authController.login);

// Forgot password (web)
router.post("/forgot-password", authController.forgotPasswordWeb);

// Forgot password (android)
router.post("/forgot-password-android", authController.forgotPasswordAndroid);

// Verifikasi kode reset password
router.post("/verify-code", authController.verifyResetCode);

// Reset password (web)
router.post("/reset-password", authController.resetPassword);

// Reset password (android)
router.post("/reset-password-android", authController.resetPasswordAndroid);

// Refresh token
router.post("/token", authController.getToken);

// ==== Rute terproteksi (memerlukan autentikasi) ====

// Update profil
router.put("/profile", auth, authController.updateProfile);

// Update password
router.put("/password", auth, authController.updatePassword);

// Logout
router.post("/logout", auth, authController.logout);

// Get profile
router.get("/profile", auth, authController.getProfile);

module.exports = router;
