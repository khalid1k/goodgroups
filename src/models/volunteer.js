const { OpportunityList } = require("./opportunityList");
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Volunteer = sequelize.define("Volunteer", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  profile_description: { type: DataTypes.TEXT },
  profile_image: { type: DataTypes.STRING },
});

module.exports = Volunteer;
