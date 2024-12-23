const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const GroupAccount = sequelize.define(
  "GroupAccount",
  {
    id: {
      type: DataTypes.STRING, // Use string type for UUID
      primaryKey: true,
      allowNull: false,
      defaultValue: () => `group-${uuidv4()}`,
    },
    groupName: {
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
    // password: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    groupType: {
      type: DataTypes.ENUM("Company", "Faith Organization", "School", "Cause"),
      allowNull: false,
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
    // passwordResetToken: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // passwordResetExpires: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = GroupAccount;
