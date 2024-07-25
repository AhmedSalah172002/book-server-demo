const multer = require("multer");

const upload = multer({ dest: "uploads/products" });

const uploadSingleImage = upload.single("image");

module.exports = uploadSingleImage;
