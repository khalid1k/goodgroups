const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Service = sequelize.define("Service", {
  text: { type: DataTypes.STRING, allowNull: false },
  image_path: { type: DataTypes.STRING },
});
module.exports = Service;
