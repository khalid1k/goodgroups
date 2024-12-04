const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Highlight = sequelize.define("Highlight", {
  text: { type: DataTypes.STRING, allowNull: false },
  image_path: { type: DataTypes.STRING },
});

module.exports = Highlight;
