const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Restriction = sequelize.define("Restriction", {
  description: { type: DataTypes.STRING },
});
module.exports = Restriction;
