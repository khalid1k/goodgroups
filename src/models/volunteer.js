const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Volunteer = sequelize.define("Volunteer", {
  name: { type: DataTypes.STRING, allowNull: false },
  profile_description: { type: DataTypes.TEXT },
  profile_image: { type: DataTypes.STRING },
});
module.exports = Volunteer;
