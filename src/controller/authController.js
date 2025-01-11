const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
// const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const passport = require("passport");
const { Sequelize } = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const IndividualUser = require("../models/individual-account");
const GroupAccount = require("../models/group-account");
const Referral = require("../models/referral");
const sendEmail = require("../utils/email");
const appError = require("../utils/appError");
// const socialTokenHelper = require("../helpers/googleSocialToken");
const { generateOtp, hashOtp } = require("../utils/otpUtils");
const { register } = require("module");
const { uploadToCloudinary } = require("../utils/cloudinary");
const {
  verifyAppleToken,
  verifyFacebookToken,
  verifyLinkedInToken,
  verifyMicrosoftToken,
  verifyGoogleToken,
} = require("../helpers/socialSigninHelper");
const { getUserById, identifyUserType } = require("../utils/userUtills");
const BlacklistedToken = require("../models/blacklistedToken");
// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const signToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: "90d",
  });
};
const createSendToken = (user, statusCode, res, message, accountType) => {
  const token = signToken({ id: user.id });
  res.status(statusCode).json({
    message: message,
    token,
    email: user.email,
    userId: user.id,
    accountType,
  });
};
// const createSendToken = (user, statusCode, res, message, accountType) => {
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIES_EXPIRES * 24 * 60 * 60 * 1000
//     ),
//     secure: true,
//     httpOnly: true,
//   };
//   const token = signToken({ id: user.id, accountType });
//   res.cookie("jwt", token, cookieOptions, accountType);
//   res.status(statusCode).json({
//     message: message,
//     token,
//     email: user.email,
//     userId: user.id,
//     accountType,
//   });
// };

exports.signUp = catchAsync(async (req, res, next) => {
  const { fullName, username, email, birthday, mobileNumber, referralCode } =
    req.body;
  if (!fullName || !username || !email || !birthday || !mobileNumber) {
    res.status(400).json({ message: "please fill all the mandatory fields" });
  }
  // Check if email exists in GroupAccount
  const existingGroupAccount = await GroupAccount.findOne({ where: { email } });
  if (existingGroupAccount) {
    return next(
      new appError("Email is already in use by a Group account.", 400)
    );
  }
  const existingUser = await IndividualUser.findOne({ where: { email } });
  if (existingUser) return next(new appError("Email is already in use.", 400));

  const existingUsername = await IndividualUser.findOne({
    where: { username },
  });
  if (existingUsername)
    return next(new appError("Username is already taken.", 400));
  const otp = generateOtp();
  const encryptedOtp = hashOtp(otp);

  // Save encrypted OTP and expiry time in the user record
  const otpExpiry = Date.now() + 1 * 60 * 1000; // OTP valid for 1 minute

  // Create user (pending OTP verification)

  const newUser = await IndividualUser.create({
    fullName,
    username,
    email,
    birthday,
    mobileNumber,
    referralCode,
    otp: encryptedOtp,
    otpExpiry,
    isVerified: false,
  });
  if (referralCode) {
    const referrer = await IndividualUser.findOne({ where: { referralCode } });
    if (referrer) {
      // Increase referrer's referral count
      referrer.referralCount = (referrer.referralCount || 0) + 1;
      await referrer.save();

      // Log the referral in the Referral table
      await Referral.create({
        referrerId: referrer.id,
        referredUserId: newUser.id,
      });
    }
  }

  await sendEmail({
    email: newUser.email,
    subject: "Your OTP valid for just 1 minute",
    message: `Your OTP is :  ${otp}`,
  });

  res.status(201).json({
    message: "User registered successfully.",
    userId: newUser.id,
    accountType: "IndividualUser",
  });
});

exports.signUpGroup = catchAsync(async (req, res, next) => {
  const { groupName, username, email, groupType, referralCode } = req.body;
  //check the individual account user if exist with that email
  const existingIndividualUser = await IndividualUser.findOne({
    where: { email },
  });
  if (existingIndividualUser)
    return next(
      new appError("Email is already in use by a individual account.", 400)
    );

  //check the group user
  const existingUser = await GroupAccount.findOne({ where: { email } });
  if (existingUser) return next(new appError("Email is already in use.", 400));

  const existingUsername = await GroupAccount.findOne({
    where: { username },
  });
  if (existingUsername)
    return res.status(400).json({ message: "Username is already taken." });
  const otp = generateOtp();
  const encryptedOtp = hashOtp(otp);
  // Save encrypted OTP and expiry time in the user record
  const otpExpiry = Date.now() + 1 * 60 * 1000; // OTP valid for 1 minute

  // Create user (pending OTP verification)

  const newUser = await GroupAccount.create({
    groupName,
    username,
    email,
    groupType,
    referralCode,
    otp: encryptedOtp,
    otpExpiry,
    isVerified: false,
  });

  await sendEmail({
    email: newUser.email,
    subject: "Your OTP valid for just 1 minute",
    message: `Your OTP is :  ${otp}`,
  });

  res.status(201).json({
    message: "User registered successfully.",
    userId: newUser.id,
    accountType: "GroupAccount",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new appError("Please provide an email.", 400));
  }

  // Find user in both models by email
  const individualUser = await IndividualUser.findOne({ where: { email } });
  const groupAccount = await GroupAccount.findOne({ where: { email } });

  // Ensure only one user is found in either model
  if (individualUser && groupAccount) {
    return next(
      new appError("An account with this email exists in multiple models.", 400)
    );
  }

  // Get the user and account type
  const user = individualUser || groupAccount;
  const accountType = individualUser ? "IndividualUser" : "GroupAccount";

  if (!user) {
    return next(new appError("User not found.", 400));
  }

  // Generate OTP
  const otp = generateOtp();
  const otpExpiry = Date.now() + 1 * 60 * 1000; // OTP valid for 1 minute
  const encryptedOtp = hashOtp(otp);

  // Save OTP and expiry in the user's record
  user.otp = encryptedOtp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Send OTP to the user's email
  await sendEmail({
    email: user.email,
    subject: "Your OTP is valid for 1 minute",
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
  const { accountType, userId } = req.query;

  // Determine the model based on accountType
  const Model =
    accountType === "IndividualUser" ? IndividualUser : GroupAccount;

  if (!Model) {
    return next(
      new appError(
        "Invalid account type. Must be 'IndividualUser' or 'GroupAccount",
        400
      )
    );
  }

  // Fetch the record based on userId (if provided) or fetch all records
  const condition = userId ? { where: { id: userId } } : {};
  const records = await Model.findAll(condition);

  // If no records found, return an appropriate message
  if (!records.length) {
    return next(new appError("No records found.", 404));
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

// Controller Function to Handle Social Logins
exports.socialLogin = catchAsync(async (req, res, next) => {
  const { provider, socialToken } = req.body;

  let userData;
  switch (provider) {
    case "google":
      userData = await verifyGoogleToken(socialToken);
      break;
    case "facebook":
      userData = await verifyFacebookToken(socialToken);
      break;
    case "apple":
      userData = await verifyAppleToken(socialToken);
      break;
    case "linkedin":
      userData = await verifyLinkedInToken(socialToken);
      break;
    case "microsoft":
      userData = await verifyMicrosoftToken(socialToken);
      break;
    default:
      return next(new appError("Unsupported provider", 400));
  }
  let accountType = "IndividualUser";
  let user = await IndividualUser.findOne({ where: { email: userData.email } });
  if (!user) {
    user = await GroupAccount.findOne({ where: { email: userData.email } });
    accountType = "GroupAccount";
  }
  if (user) {
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }
    let message = "Login Successful!";
    createSendToken(user, 200, res, message, accountType);
    // const token = signToken(user.id);
    // return res.status(200).json({
    //   message: "Login successful",
    //   userRegister: true,
    //   token,
    //   email: userData.email,
    //   accountType,
    // });
  }

  return res.status(202).json({
    userRegister: false,
    email: userData.email,
  });
});

//delete user
exports.deleteUser = async (req, res) => {
  const { email } = req.params; // Assuming the email is passed as a URL parameter

  try {
    const user = await IndividualUser.destroy({
      where: {
        email: email,
      },
    });

    if (user) {
      return res.status(200).json({ message: "User deleted successfully." });
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

exports.protectRoute = catchAsync(async (req, res, next) => {
  let token;

  // Extract the token from the authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new appError("You are not logged in. Please log in to access.", 401)
    );
  }

  // Check if the token is blacklisted
  const blacklistedToken = await BlacklistedToken.findOne({ where: { token } });

  if (blacklistedToken) {
    return next(
      new appError("This token has been logged out or invalidated.", 401)
    );
  }

  try {
    // Verify the token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.TOKEN_SECRET
    );

    // Check if the user exists
    const user = await getUserById(decoded.id);
    if (!user) {
      return next(
        new appError("The user associated with this token does not exist.", 401)
      );
    }

    // Attach the user to the request object
    req.user = user;

    // Grant access to the route
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        new appError("Your session has expired. Please log in again.", 401)
      );
    }
    return next(new appError("Invalid token. Please log in again.", 401));
  }
});

//controller to get the users with their groups
exports.getUserWithGroups = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    return next(new appError("userId is required", 400));
  }
  // Determine if the user is an IndividualUser or GroupAccount
  const userType = identifyUserType(userId);
  if (userType === "IndividualUser") {
    let user = await IndividualUser.findByPk(userId, {
      attributes: {
        exclude: ["otp", "otpExpiry", "isVerified"], // Exclude sensitive fields
      },
      include: [
        {
          model: GroupAccount,
          attributes: ["groupName"], // Fetch only the group name
          through: { attributes: [] }, // Don't include 'through' attributes like userId, groupId
        },
      ],
    });

    if (!user) {
      return next(new appError("User not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: user, // User will have the associated groups
    });
  } else {
    let user = await GroupAccount.findByPk(userId, {
      include: [
        {
          model: IndividualUser,
          attributes: ["fullName"], // Fetch the individual's full name
          through: { attributes: [] }, // Don't include 'through' attributes like userId, groupId
        },
      ],
    });

    if (!user) {
      return next(new appError("User not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: user, // User will have the associated groups
    });
  }
});

exports.updateIndividualUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new appError("userId is required"), 404);
  }
  if (Object.keys(req.body).length === 0) {
    return next(new appError("there are no fields to update", 404));
  }
  const user = await IndividualUser.findByPk(id);
  if (!user) {
    return next(new appError("user not found ", 404));
  }
  console.log("body data is ", req.body);
  const data = req.body;
  let profilePhotoUrl;
  if (req.files.profilePhoto && req.files.profilePhoto.length > 0) {
    const profilePhotoFile = req.files.profilePhoto[0];
    const profilePhotoName = `${Date.now()}-${profilePhotoFile.originalname}`;
    profilePhotoUrl = await uploadToCloudinary(
      profilePhotoFile.buffer,
      profilePhotoName
    ); // Upload profilePhoto
  }

  const updates = { ...user.toJSON(), ...data };
  updates.photo = profilePhotoUrl;
  console.log("data before updates is ", updates);
  const updatedUser = await user.update(updates);
  // Respond with success
  res.status(200).json({
    status: "success",
    message: "user updated successfully.",
    // data: updatedUser,
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return next(new appError("Token is required to logout.", 400));
  }

  // Decode the token to get the expiry date
  const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET);
  const expiryDate = new Date(decoded.exp * 1000); // Convert from seconds to milliseconds

  // Add the token to the blacklist with the expiry date
  await BlacklistedToken.create({ token, expiryDate });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully.",
  });
});
