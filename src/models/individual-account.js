const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const getQuarterFromDate = require("../helpers/getQuarter");
const QuarterlyStats = require("../models/quarterlyStats");
const IndividualUser = sequelize.define(
  "IndividualUser",
  {
    id: {
      type: DataTypes.STRING, // Use string type for UUID
      primaryKey: true,
      allowNull: false,
      defaultValue: () => `individual-${uuidv4()}`,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mission: {
      type: DataTypes.STRING,
      defaultValue:
        "Our Mission is to help homeless individuals in Southern California.",
    },
    hours: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    photo: {
      type: DataTypes.STRING,
      defaultValue:
        "https://media.istockphoto.com/id/1386479313/photo/happy-millennial-afro-american-business-woman-posing-isolated-on-white.jpg?b=1&s=612x612&w=0&k=20&c=MsKXmwf7TDRdKRn_lHohhmD5rvVvnGs9ry0xl6CrMT4=",
    },
    referralCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    about: {
      type: DataTypes.TEXT,
    },
    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    followers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    points: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    isInfluencer: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isManger: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    levels: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    connections: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    referral: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    presidentialRewards: {
      type: DataTypes.ENUM("0", "1", "2", "3"),
      defaultValue: "0",
    },
    referralCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    cancellation: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

IndividualUser.beforeCreate(async (user) => {
  // Generate referral code based on the UUID
  const hash = crypto.createHash("md5").update(user.id).digest("hex");
  user.referralCode = parseInt(hash.slice(0, 8), 16).toString().slice(0, 8); // Shortened code
});

// IndividualUser.addHook("afterUpdate", async (user, options) => {
//   const { hours, referralCount, donation, cancellation, id, updatedAt } = user;

//   // Get the current quarter and year
//   const currentYear = updatedAt.getFullYear();
//   const currentQuarter = getQuarterFromDate(updatedAt);

//   // Check if any of the fields have changed
//   if (
//     user.previous("hours") !== hours ||
//     user.previous("referralCount") !== referralCount ||
//     user.previous("donation") !== donation ||
//     user.previous("cancellation") !== cancellation
//   ) {
//     // Update or create new quarterly stats for this user
//     await QuarterlyStats.upsert({
//       userId: id,
//       year: currentYear,
//       quarter: currentQuarter,
//       hours,
//       referralCount,
//       donation,
//       cancellation,
//     });
//   }
// });

// IndividualUser.hasMany(QuarterlyStats, {
//   foreignKey: "userId",
//   onDelete: "CASCADE",
// });
// QuarterlyStats.belongsTo(IndividualUser, {
//   foreignKey: "userId",
//   onDelete: "CASCADE",
// });

module.exports = IndividualUser;
