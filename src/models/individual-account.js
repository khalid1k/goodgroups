const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
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
  },
  {
    timestamps: true,
  }
);

module.exports = IndividualUser;
