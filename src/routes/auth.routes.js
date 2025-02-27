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
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.put("/profile", authenticate, authController.updateProfile);
router.put("/password", authenticate, authController.updatePassword);

router.post("/logout", authenticate, authController.logout);

router.get("/profile", authenticate, authController.getProfile);

router.post("/token", authController.getToken);

module.exports = router;
