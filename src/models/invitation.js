const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Invitation = sequelize.define(
  "Invitation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
    invitedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invitedTo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
  {
    tableName: "Invitation",
  }
);

module.exports = Invitation;
