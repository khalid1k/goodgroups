const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const IndividualUser = require("../models/individual-account");
const Volunteer = sequelize.define(
  "Volunteer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    opportunityDate: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: IndividualUser, // Reference to User model/table
        key: "id",
      },
      onDelete: "CASCADE", // If user is deleted, remove volunteer entry
    },
    opportunityId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "OpportunityList",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    timestamps: true,
  }
);

IndividualUser.hasMany(Volunteer, { foreignKey: "userId", as: "volunteers" });
Volunteer.belongsTo(IndividualUser, { foreignKey: "userId", as: "user" });

module.exports = Volunteer;
