const { hashOtp, isOtpExpired, generateOtp } = require("../utils/otpUtils");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");
const IndividualUser = require("../models/individual-account");
const GroupAccount = require("../models/group-account");
const jwt = require("jsonwebtoken");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: "90d",
  });
};
const createSendToken = (user, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  };
  const token = signToken(user.id);
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    message: "success",
    token,
    user,
  });
};

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { userId, otp, accountType } = req.body;

  // Find user by ID
  const Model =
    accountType === "IndividualUser" ? IndividualUser : GroupAccount;
  const user = await Model.findByPk(userId);

  if (!user) return res.status(404).json({ message: "User not found." });

  if (isOtpExpired(user.otpExpiry)) {
    return res
      .status(400)
      .json({ message: "OTP has expired. Please request a new one." });
  }
  const hashedInputOtp = hashOtp(otp);
  if (hashedInputOtp !== user.otp) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  // Mark the user as verified
  user.isVerified = true;
  user.otp = null; // Clear OTP
  user.otpExpiry = null; // Clear OTP expiry
  await user.save();

  // res.status(200).json({ message: "Email verified successfully." });
  createSendToken(user, 200, res);
});

// controller to resend the otp

exports.resendOtp = catchAsync(async (req, res, next) => {
  const { userId, accountType } = req.body;

  // Determine the model based on accountType
  const Model =
    accountType === "IndividualUser" ? IndividualUser : GroupAccount;

  // Find user or group account by ID
  const user = await Model.findByPk(userId);

  if (!user) {
    return res.status(404).json({ message: "Account not found." });
  }

  // Check if OTP already exists and hasn't expired
  if (!isOtpExpired(user.otpExpiry)) {
    return res.status(400).json({
      message: "Current OTP is still valid. Please wait for it to expire.",
    });
  }

  // Generate a new OTP
  const otp = generateOtp();

  const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  // Encrypt OTP before saving
  const encryptedOtp = hashOtp(otp);
  user.otp = encryptedOtp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Send the new OTP via email
  await sendEmail({
    email: user.email,
    subject: "Your OTP valid for just 10mins",
    message: `Your OTP is :  ${otp}`,
  });

  res.status(200).json({
    message: "A new OTP has been sent to your email.",
  });
});
