const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Review = sequelize.define("Review", {
  rating_count: { type: DataTypes.FLOAT, allowNull: false },
  date: { type: DataTypes.BIGINT, allowNull: false },
  role: { type: DataTypes.STRING },
  review: { type: DataTypes.TEXT },
  profile_picture: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
});
module.exports = Review;
