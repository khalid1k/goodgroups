const express = require("express");
const router = express.Router();
const otpController = require("../controller/verifyOtpController");
router.post("/verifyOtp", otpController.verifyOtp);
router.post("/resendOtp", otpController.resendOtp);
module.exports = router;
