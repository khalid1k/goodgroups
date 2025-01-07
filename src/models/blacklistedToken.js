const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const BlacklistedToken = sequelize.define(
  "BlacklistedToken",
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "BlacklistedToken",
    indexes: [
      {
        unique: true, // If you want the token to be unique across the table
        fields: ["token"], // Column(s) to add the index to
      },
    ],
  }
);
module.exports = BlacklistedToken;
