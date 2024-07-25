const UserModel = require("../models/UserModel");
const AppError = require("../utils/AppError");
const CreateToken = require("../utils/CreateToken");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendCodeEmail = require("../utils/ResetCodeMail");

exports.register = asyncHandler(async (req, res, next) => {
  const user = await UserModel.create(req.body);

  token = CreateToken({ id: user._id, role: user.role, email: user.email });
  res.status(201).json({ data: user, token });
});

exports.login = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("user incorrect please try again", 401));
  }
  if (!(await bcrypt.compare(req.body.password, user.password))) {
    return next(new AppError("password incorrect please try again", 401));
  }
  delete user._doc.password;

  token = CreateToken({ id: user._id, role: user.role, email: user.email });
  res.status(200).json({ data: user, token });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError(
        "You are not login, Please login to get access this route",
        401
      )
    );
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const currentUser = await UserModel.findById(payload.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }

  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    if (passChangedTimestamp > payload.iat) {
      return next(
        new AppError(
          "User recently changed his password. please login again..",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(`There is no user with that email ${req.body.email}`, 404)
    );
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 5 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  const message = `Hi ${user.first_name},\n We received a request to reset the password on your ${process.env.FOUNDATION_NAME} Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The ${process.env.FOUNDATION_NAME} Team`;
  try {
    await sendCodeEmail({
      email: user.email,
      subject: "Your password reset code (valid for 5 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new AppError(`There is an error in sending email`, 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await UserModel.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Reset code invalid or expired"));
  }

  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "Success",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  if (!user.passwordResetVerified) {
    return next(new AppError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  const token = CreateToken({
    id: user._id,
    role: user.role,
    email: user.email,
  });
  res.status(200).json({ token });
});
