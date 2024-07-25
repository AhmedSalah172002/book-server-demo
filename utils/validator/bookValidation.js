const { check } = require("express-validator");
const {
  ValidationMiddleware,
} = require("../../middleware/ValidationMiddleware");

exports.getBookValidator = [
  check("id")
    .isMongoId()
    .withMessage(
      "Invalid Book ID Format: Expected an mongoId value for book  ID."
    ),
  ValidationMiddleware,
];

exports.createBookValidator = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("Book name must be more than 3 characters long."),

  check("pages")
    .isInt({ min: 1 })
    .withMessage("Pages must be a number greater than 0."),
  ValidationMiddleware,
];

exports.updateBookValidator = [
  check("id")
    .isMongoId()
    .withMessage(
      "Invalid Book ID Format: Expected a mongoId value for book ID."
    ),

  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Book name must be more than 3 characters long."),

  check("pages")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Pages must be a number greater than 0."),
  ValidationMiddleware,
];

exports.deleteBookValidator = [
  check("id")
    .isMongoId()
    .withMessage(
      "Invalid Book ID Format: Expected a mongoId value for book ID."
    ),
  ValidationMiddleware,
];
