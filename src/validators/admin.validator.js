const { body, validationResult } = require("express-validator");

const validateAdmin = [
  // Validate name
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),
  
  // Validate email
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),
  
  // Validate password (only required for new admins)
  body("password")
    .optional({ nullable: true })  // Password can be omitted during updates
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  
  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = {
  validateAdmin
};