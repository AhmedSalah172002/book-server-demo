const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  publicationDate: {
    type: Date,
    default: Date.now,
  },
  imageUrl: { type: String, required: false},
  type: {
    type: String,
    trim: true,
  },
  pages: {
    type: Number,
    min: 1,
  },
  summary: {
    type: String,
    trim: true,
  },
});

BookSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: 'email first_name last_name -_id',
  });
  next();
});

const BookModel = mongoose.model("Book", BookSchema);

module.exports = BookModel;
