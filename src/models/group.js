const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

class Group extends Model {}

Group.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Group",
  }
);

module.exports = Group;
