const express = require("express");
const router = express.Router();

// Import the required controllers and middleware functions
const {
  login,
  signup,
  sendotp,
  changePassword,
} = require("../Controller/Auth");

const {
  resetPasswordToken,
  resetPassword,
} = require("../Controller/ResetPassword");

const { auth } = require("../Middleware/Auth");

// Routes for Login, Signup, and Authentication

// 
router.post("/login", login);

router.post("/signup", signup);

router.post("/sendotp", sendotp);

router.post("/changepassword", auth, changePassword);

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword);

module.exports = router;
