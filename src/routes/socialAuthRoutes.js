const express = require("express");
const authController = require("../controller/authController");

const router = express.Router();

// Endpoint for social login

router.post("/auth/social-login", authController.socialLogin);

module.exports = router;
