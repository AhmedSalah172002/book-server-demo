const express = require("express");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
var cors = require("cors");
const path = require('path');

const DatabaseConnection = require("./config/DatabaseConnection");
// routing links
const bookRouter = require("./router/BookRouter");
const AuthRouter = require("./router/AuthRouter");

const AppError = require("./utils/AppError");
const globalError = require("./middleware/ErrorMiddleware");

// server
const app = express();
const port = process.env.PORT;

// cors
app.use(cors());

// connect to DB
DatabaseConnection();

// middleware for make request as json
app.use(express.json());

app.use(express.static(path.join(__dirname, 'uploads')));


// middleware for api in dev mode
if (process.env.MODE === "dev") {
  app.use(morgan("dev"));
}

// routing
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/auth", AuthRouter);

// middleware for wrong routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find this route: ${req.originalUrl}`, 404));
});

// global middleware for error
app.use(globalError);

app.listen(port, () => console.log(`server running on port ${port}`));
