const { body } = require("express-validator");

const createReportValidator = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 words")
    .custom((value) => value.split(" ").length >= 5)
    .withMessage("Title must be at least 5 words"),
  body("violation").isString().withMessage("Violation must be a string"),
  body("location").isString().withMessage("Location must be a string"),
  body("date").isISO8601().withMessage("Date must be a valid date"),
  body("actors").isString().withMessage("Actors must be a string"),
  body("detail")
    .isString()
    .withMessage("Detail must be a string")
    .isLength({ min: 50 })
    .withMessage("Detail must be at least 50 characters"),
  body("is_anonymous")
    .isBoolean()
    .withMessage("Is anonymous must be a boolean"),
];

module.exports = { createReportValidator };
