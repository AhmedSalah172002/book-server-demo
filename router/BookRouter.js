const express = require("express");
const {
  getBooks,
  createBook,
  getBook,
  deleteBook,
  updateBook,
} = require("../controller/BookController");
const {
  getBookValidator,
  createBookValidator,
  updateBookValidator,
  deleteBookValidator,
} = require("../utils/validator/bookValidation");
const { protect, allowedTo } = require("../controller/AuthController");
const uploadSingleImage = require("../utils/UploadSingleImage");
const router = express.Router();

router
  .route("/")
  .get(getBooks)
  .post(
    protect,
    allowedTo("author"),
    uploadSingleImage,
    createBookValidator,
    createBook
  );

router
  .route("/:id")
  .get(getBookValidator, getBook)
  .delete(protect, allowedTo("author"), deleteBookValidator, deleteBook)
  .put(protect, allowedTo("author"), updateBookValidator, updateBook);

module.exports = router;
