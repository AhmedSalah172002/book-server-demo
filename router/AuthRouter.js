const express = require("express");
const {
  registerValidator,
  loginValidator,
} = require("../utils/validator/authValidation");
const {
  register,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../controller/AuthController");

const router = express.Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyPassResetCode);
router.put("/reset-password", resetPassword);

module.exports = router;
