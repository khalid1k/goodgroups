const crypto = require("crypto");

exports.generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

exports.isOtpExpired = (otpExpiry) => {
  const currentTime = new Date();
  return currentTime > new Date(otpExpiry); // Returns true if OTP is expired
};
