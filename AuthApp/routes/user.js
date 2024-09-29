const express = require("express");
const router = express.Router();

const {login, signup} = require("../controllers/auth");
const { auth, isStudent, isAdmin } = require("../middleware/auth");

router.post("/login", login);
router.post("/signup", signup);

//testing protected routes for single middlewares
router.get("/test", auth, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to protected route for test",
  });
});

//protected route
router.get("/student", auth, isStudent, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to protected route for student",
  });
});

router.get("/admin", auth, isAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Welcoe to the protected route for admin",
  });
});

module.exports = router;