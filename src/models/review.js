const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    rating_count: { type: DataTypes.FLOAT, allowNull: false },
    date: { type: DataTypes.BIGINT, allowNull: false },
    role: { type: DataTypes.STRING },
    review: { type: DataTypes.TEXT },
    profile_picture: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
  },
  {
    tableName: "Review",
  }
);
module.exports = Review;
