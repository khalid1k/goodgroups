const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const IndividualUser = require("../models/individual-account");
const GroupAccount = require("../models/group-account");
const sendEmail = require("../utils/email");
const appError = require("../utils/appError");
const { generateOtp, hashOtp } = require("../utils/otpUtils");
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
  const token = signToken(user._id);
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    message: "success",
    token,
    user,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const {
    fullName,
    username,
    email,
    password,
    birthday,
    mobileNumber,
    referralCode,
  } = req.body;

  // Check if email exists in GroupAccount
  const existingGroupAccount = await GroupAccount.findOne({ where: { email } });
  if (existingGroupAccount) {
    return res
      .status(400)
      .json({ message: "Email is already in use by a Group account." });
  }
  const existingUser = await IndividualUser.findOne({ where: { email } });
  if (existingUser)
    return res.status(400).json({ message: "Email is already in use." });

  const existingUsername = await IndividualUser.findOne({
    where: { username },
  });
  if (existingUsername)
    return res.status(400).json({ message: "Username is already taken." });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = generateOtp();
  const encryptedOtp = hashOtp(otp);

  // Save encrypted OTP and expiry time in the user record
  const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  // Create user (pending OTP verification)
  const newUser = await IndividualUser.create({
    fullName,
    username,
    email,
    password: hashedPassword,
    birthday,
    mobileNumber,
    referralCode,
    otp: encryptedOtp,
    otpExpiry,
    isVerified: false,
  });

  await sendEmail({
    email: newUser.email,
    subject: "Your OTP valid for just 10mins",
    message: `Your OTP is :  ${otp}`,
  });

  res.status(201).json({
    message: "User registered successfully.",
    userId: newUser.id,
    accountType: "IndividualUser",
  });
});

exports.signUpGroup = catchAsync(async (req, res, next) => {
  const { groupName, username, email, password, groupType, referralCode } =
    req.body;
  //check the individual account user if exist with that email
  const existingIndividualUser = await IndividualUser.findOne({
    where: { email },
  });
  if (existingIndividualUser)
    return res
      .status(400)
      .json({ message: "Email is already in use by a individual account." });
  //check the group user
  const existingUser = await GroupAccount.findOne({ where: { email } });
  if (existingUser)
    return res.status(400).json({ message: "Email is already in use." });

  const existingUsername = await GroupAccount.findOne({
    where: { username },
  });
  if (existingUsername)
    return res.status(400).json({ message: "Username is already taken." });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = generateOtp();
  const encryptedOtp = hashOtp(otp);

  // Save encrypted OTP and expiry time in the user record
  const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  // Create user (pending OTP verification)
  const newUser = await GroupAccount.create({
    groupName,
    username,
    email,
    password: hashedPassword,
    groupType,
    referralCode,
    otp: encryptedOtp,
    otpExpiry,
    isVerified: false,
  });

  await sendEmail({
    email: newUser.email,
    subject: "Your OTP valid for just 10mins",
    message: `Your OTP is :  ${otp}`,
  });

  res.status(201).json({
    message: "User registered successfully.",
    userId: newUser.id,
    accountType: "GroupAccount",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please provide an email." });
  }

  // Find user in both models by email
  const individualUser = await IndividualUser.findOne({ where: { email } });
  const groupAccount = await GroupAccount.findOne({ where: { email } });

  // Ensure only one user is found in either model
  if (individualUser && groupAccount) {
    return res.status(400).json({
      message: "An account with this email exists in multiple models.",
    });
  }

  // Get the user and account type
  const user = individualUser || groupAccount;
  const accountType = individualUser ? "IndividualUser" : "GroupAccount";

  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid password." });
  }

  // Generate OTP
  const otp = generateOtp();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  const encryptedOtp = hashOtp(otp);

  // Save OTP and expiry in the user's record
  user.otp = encryptedOtp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Send OTP to the user's email
  await sendEmail({
    email: user.email,
    subject: "Your OTP is valid for 10 minutes",
    message: `Your OTP is: ${otp}`,
  });

  // Respond with a success message and user details
  res.status(200).json({
    message: "OTP sent to your email. Please verify.",
    userId: user.id,
    accountType,
  });
});

//get the users
exports.getRecords = catchAsync(async (req, res, next) => {
  const { accountType, userId } = req.params;

  // Determine the model based on accountType
  const Model =
    accountType === "IndividualUser" ? IndividualUser : GroupAccount;

  if (!Model) {
    return res.status(400).json({
      message:
        "Invalid account type. Must be 'IndividualUser' or 'GroupAccount'.",
    });
  }

  // Fetch the record based on userId (if provided) or fetch all records
  const condition = userId ? { where: { id: userId } } : {};
  const records = await Model.findAll(condition);

  // If no records found, return an appropriate message
  if (!records.length) {
    return res.status(404).json({ message: "No records found." });
  }

  // Respond with the fetched records
  res.status(200).json({
    status: "success",
    data: records,
  });
});

// Forgot Password Controller
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Find user in both models by email
  const individualUser = await IndividualUser.findOne({ where: { email } });
  const groupAccount = await GroupAccount.findOne({ where: { email } });
  // Get the user and account type
  const user = individualUser || groupAccount;
  const accountType = individualUser ? "IndividualUser" : "GroupAccount";

  if (!user) {
    return next(new appError(`No user found with email: ${email}`, 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set reset token and expiration time
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
  await user.save();

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/user/reset-Password/${resetToken}?accountType=${accountType}`;

  // Email message
  const message = `Password Reset Link:<br> <a href=${resetUrl}>${resetUrl}</a>`;

  try {
    // Send email
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email.",
      accountType,
    });
  } catch (err) {
    console.error("Error sending email: ", err);

    // Clear reset token and expiration on error
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return next(
      new appError(
        "There was an error sending the email. Please try again later.",
        500
      )
    );
  }
});

// Reset Password Controller
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const { token } = req.params;
  const { accountType } = req.query;
  console.log("ReSet", accountType, token, password);
  // Validate input
  if (!token || !accountType || !password) {
    return next(new appError("All fields are required.", 400));
  }

  // Determine the model based on accountType
  const Model =
    accountType === "IndividualUser" ? IndividualUser : GroupAccount;

  if (!Model) {
    return next(
      new appError(
        "Invalid account type. Must be 'IndividualUser' or 'GroupAccount'.",
        400
      )
    );
  }

  // Hash the token to match the stored value
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with matching reset token and valid expiration
  const user = await Model.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Sequelize.Op.gt]: Date.now() }, // Token must be valid
    },
  });

  if (!user) {
    return next(new appError("Invalid or expired reset token.", 400));
  }

  // Hash password
  user.password = await bcrypt.hash(password, 10);
  // Clear reset token and expiration
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "password is successfully reset.",
  });
});
