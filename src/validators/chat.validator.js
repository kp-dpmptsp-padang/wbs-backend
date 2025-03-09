const { body, validationResult } = require("express-validator");

/**
 * Validator untuk pengiriman pesan chat
 */
const validateChatMessage = [
  // Validasi message
  body("message")
    .notEmpty()
    .withMessage("Pesan tidak boleh kosong")
    .isLength({ max: 2000 })
    .withMessage("Pesan tidak boleh lebih dari 2000 karakter"),
  
  // Middleware untuk memeriksa hasil validasi
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validasi gagal", 
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = {
  validateChatMessage
};