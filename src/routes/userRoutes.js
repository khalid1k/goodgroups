const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/signupGroup", authController.signUpGroup);
router.post("/loginGroup", authController.loginGroup);
router.get("/getRecords", authController.getRecords);
module.exports = router;
