const BookModel = require("../models/BookModel");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const cloudinary = require("../utils/CloudinaryConfig");

exports.getBooks = asyncHandler(async (req, res, next) => {
  const queryString = req.query;
  let query = {};

  // sorting
  let sort = queryString.sort?.split(",").join(" ") || "-createAt";

  // limit fields
  let fields = queryString.fields?.split(",").join(" ") || "-__v";

  // search
  let keyword = queryString.keyword;
  if (keyword) {
    query.name = { $regex: keyword, $options: "i" };
  }

  // filter
  const skipKeys = ["sort", "keyword", "page", "limit", "fields"];
  Object.keys(queryString).forEach((key) => {
    if (!skipKeys.includes(key)) {
      let queryValue = queryString[key];
      let queryStringValue = JSON.stringify(queryValue);
      let newQueryValue = queryStringValue.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      query[key] = JSON.parse(newQueryValue);
    }
  });

  // pagination
  const page = queryString.page * 1 || 1;
  const limit = queryString.limit * 1 || 5;
  const skip = (page - 1) * limit;
  const endIndex = page * limit;

  const count = await BookModel.countDocuments(query);
  const numberOfPages = Math.ceil(count / limit);
  const nextPage = endIndex < count ? page + 1 : false;
  const prevPage = skip > 0 ? page - 1 : false;

  // find all
  const books = await BookModel.find(query)
    .sort(sort)
    .select(fields)
    .limit(limit)
    .skip(skip);

  res.status(200).json({
    results: count,
    totalPages: numberOfPages,
    currentPage: page,
    itemsPerPage: limit,
    nextPage: nextPage ? nextPage : null,
    prevPage: prevPage ? prevPage : null,
    data: books,
  });
});

exports.createBook = asyncHandler(async (req, res, next) => {

  const { name, type, pages, summary } = req.body;
  const imagePath = req.file.path;

  const result = await cloudinary.uploader.upload(imagePath, {
    folder: "products",
  });
  if(!result){
    return next(AppError('Error while uploading image',400))
  }
  const book = await BookModel.create({
    name,
    type,
    pages,
    summary,
    author: req.user._id,
    imageUrl: result.secure_url,
  });
  res.status(201).json({ data: book });
});

exports.getBook = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const book = await BookModel.findById(id);
  if (!book) {
    return next(new AppError("Book not found", 404));
  }
  res.status(200).json({ data: book });
});

exports.deleteBook = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const book = await BookModel.findOneAndDelete({
    _id: id,
    author: req.user._id,
  });
  if (!book) {
    return next(new AppError("Book not found", 404));
  }
  res.status(204).json({ data: "Book deleted successfully" });
});

exports.updateBook = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const book = await BookModel.findOneAndUpdate(
    {
      _id: id,
      author: req.user._id,
    },
    req.body,
    { new: true }
  );
  if (!book) {
    return next(new AppError("Book not found", 404));
  }
  res.status(200).json({ data: book });
});
