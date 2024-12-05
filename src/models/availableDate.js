const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const AvailableDate = sequelize.define("AvailableDate", {
  date: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = AvailableDate;
