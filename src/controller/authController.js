const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const IndividualUser = require("../models/individual-account");
const GroupAccount = require("../models/group-account");
const sendEmail = require("../utils/email");
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

  res
    .status(201)
    .json({ message: "User registered successfully.", userId: newUser.id });
});

//login controller

exports.login = catchAsync(async (req, res, next) => {
  const { email, username, password } = req.body;

  // Find user by email or username
  const user = await IndividualUser.findOne({
    where: { [Sequelize.Op.or]: [{ email }, { username }] },
  });

  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  // Compare the password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid password." });
  }

  // Generate OTP
  const otp = generateOtp();

  // Save encrypted OTP and expiry time in the user record
  const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  // Encrypt OTP before saving
  const encryptedOtp = hashOtp(otp);
  user.otp = encryptedOtp;
  user.otpExpiry = otpExpiry;

  await user.save();

  // Send OTP to the user's email
  await sendEmail({
    email: user.email,
    subject: "Your OTP valid for just 10mins",
    message: `Your OTP is :  ${otp}`,
  });

  // Respond with a message asking the user to verify the OTP
  res.status(200).json({
    message: "OTP sent to your email. Please verify.",
    userId: user.id,
  });
});

//group-user signUp controller

exports.signUpGroup = catchAsync(async (req, res, next) => {
  const { groupName, username, email, password, groupType, referralCode } =
    req.body;
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

  res
    .status(201)
    .json({ message: "User registered successfully.", userId: newUser.id });
});

//Group login controller

exports.loginGroup = catchAsync(async (req, res, next) => {
  const { email, username, password } = req.body;

  // Find user by email or username
  const user = await IndividualUser.findOne({
    where: { [Sequelize.Op.or]: [{ email }, { username }] },
  });

  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  // Compare the password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid password." });
  }

  // Generate OTP
  const otp = generateOtp();

  // Save encrypted OTP and expiry time in the user record
  const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  // Encrypt OTP before saving
  const encryptedOtp = hashOtp(otp);
  user.otp = encryptedOtp;
  user.otpExpiry = otpExpiry;

  await user.save();

  // Send OTP to the user's email
  await sendEmail({
    email: user.email,
    subject: "Your OTP valid for just 10mins",
    message: `Your OTP is :  ${otp}`,
  });

  // Respond with a message asking the user to verify the OTP
  res.status(200).json({
    message: "OTP sent to your email. Please verify.",
    userId: user.id,
  });
});

//get the users
exports.getRecords = catchAsync(async (req, res, next) => {
  const { accountType, userId } = req.params;

  // Determine the model based on accountType
  const Model =
    accountType === "IndividualUser" ? IndividualUser : GroupAccount;

  if (!Model) {
    return res
      .status(400)
      .json({
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
