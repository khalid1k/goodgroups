// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../config/db");
// const IndividualUser = require("../models/individual-account");
// const QuarterlyStats = sequelize.define("QuarterlyStats", {
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true,
//   },
//   userId: {
//     type: DataTypes.STRING,
//     references: {
//       model: IndividualUser,
//       key: "id",
//     },
//     onDelete: "CASCADE",
//   },
//   year: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   quarter: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   hours: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0,
//   },
//   referralCount: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0,
//   },
//   donation: {
//     type: DataTypes.FLOAT,
//     defaultValue: 0.0,
//   },
//   cancellation: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0,
//   },
// });

// module.exports = QuarterlyStats;
