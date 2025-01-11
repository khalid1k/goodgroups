const { hashOtp, isOtpExpired, generateOtp } = require("../utils/otpUtils");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");
const appError = require("../utils/appError");
const IndividualUser = require("../models/individual-account");
const GroupAccount = require("../models/group-account");
const jwt = require("jsonwebtoken");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: "90d",
  });
};
const createSendToken = (user, statusCode, res, accountType, email, name) => {
  const token = signToken(user.id);
  res.status(statusCode).json({
    message: "success",
    token,
    userId: user.id,
    accountType,
    email,
    name,
  });
};

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { userId, otp, accountType } = req.body;

  // Find user by ID
  const Model =
    accountType === "IndividualUser" ? IndividualUser : GroupAccount;
  const user = await Model.findByPk(userId);

  if (!user) return next(new appError("User not found.", 404));

  if (isOtpExpired(user.otpExpiry)) {
    return next(
      new appError("OTP has expired. Please request a new one.", 400)
    );
  }
  const hashedInputOtp = hashOtp(otp);
  if (hashedInputOtp !== user.otp) {
    return next(new appError("Invalid OTP.", 400));
  }
  let name;
  if (accountType === "IndividualUser") {
    name = user.fullName;
  } else {
    name = user.groupName;
  }

  // Mark the user as verified
  user.isVerified = true;
  user.otp = null; // Clear OTP
  user.otpExpiry = null; // Clear OTP expiry
  await user.save();
  createSendToken(user, 200, res, accountType, user.email, name);
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
    return next(new appError("Account not found.", 404));
  }

  // Check if OTP already exists and hasn't expired
  if (!isOtpExpired(user.otpExpiry)) {
    return next(
      new appError(
        "Current OTP is still valid. Please wait for it to expire.",
        400
      )
    );
  }

  // Generate a new OTP
  const otp = generateOtp();

  const otpExpiry = Date.now() + 1 * 60 * 1000; // OTP valid for 1 minute

  // Encrypt OTP before saving
  const encryptedOtp = hashOtp(otp);
  user.otp = encryptedOtp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Send the new OTP via email
  sendEmail({
    email: user.email,
    subject: "Your OTP valid for just 1 minute",
    message: `Your OTP is :  ${otp}`,
  });

  res.status(200).json({
    message: "A new OTP has been sent to your email.",
  });
});
