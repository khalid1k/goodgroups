const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const IndividualUser = require("./individual-account");
const Referral = sequelize.define("Referral", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  referrerId: {
    type: DataTypes.STRING,
    references: {
      model: IndividualUser,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  referredUserId: {
    type: DataTypes.STRING,
    references: {
      model: IndividualUser,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// IndividualUser.hasMany(Referral, {
//     foreignKey: "referrerId", // Links to the referrer
//     as: "referrals", // Alias for better readability
//     onDelete: "CASCADE",
// });

// IndividualUser.hasOne(Referral, {
//     foreignKey: "referredUserId",
//     as: "referrer",
//     onDelete: "CASCADE",
// });

// // Referral Model
// Referral.belongsTo(IndividualUser, {
//     foreignKey: "referrerId",
//     as: "referrer", // Alias for the referrer
// });

// Referral.belongsTo(IndividualUser, {
//     foreignKey: "referredUserId",
//     as: "referredUser",
// });

module.exports = Referral;
