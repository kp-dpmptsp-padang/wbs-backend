const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  validateRegister,
  validateLogin,
} = require("../validators/auth.validator");
const authenticate = require("../middlewares/auth.middleware");

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/forgot-password", authController.forgotPasswordWeb);
router.post("/forgot-password-android", authController.forgotPasswordAndroid);
router.post("/verify-code", authController.verifyResetCode);
router.post("/reset-password", authController.resetPassword);
router.post("/reset-password-android", authController.resetPasswordAndroid);

router.put("/profile", authenticate, authController.updateProfile);
router.put("/password", authenticate, authController.updatePassword);

router.post("/logout", authenticate, authController.logout);

router.get("/profile", authenticate, authController.getProfile);

router.post("/token", authController.getToken);

module.exports = router;
