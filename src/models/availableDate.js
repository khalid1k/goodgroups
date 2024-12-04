const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const AvailableDate = sequelize.define("AvailableDate", {
  date: { type: DataTypes.DATE, allowNull: false },
});

module.exports = AvailableDate;
