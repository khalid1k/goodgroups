const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { OpportunityList } = require("./opportunityList");
const IndividualUser = require("./individual-account");
const GroupAccount = require("./group-account");

const ReservedOpportunityList = sequelize.define("ReservedOpportunityList", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  opportunityListId: {
    type: DataTypes.INTEGER,
    references: {
      model: OpportunityList,
      key: "id",
    },
    allowNull: false,
  },
  // Can store user information as either Individual or Group
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userType: {
    type: DataTypes.ENUM("IndividualUser", "GroupAccount"),
    allowNull: false,
  },
});

// Associations
ReservedOpportunityList.belongsTo(OpportunityList, {
  foreignKey: "opportunityListId",
});

// If an IndividualUser reserves the opportunity
ReservedOpportunityList.belongsTo(IndividualUser, {
  foreignKey: "userId",
  constraints: false, // To allow joining on either IndividualUser or GroupAccountUser
  as: "individualUser",
});

// If a GroupAccountUser reserves the opportunity
ReservedOpportunityList.belongsTo(GroupAccount, {
  foreignKey: "userId",
  constraints: false,
  as: "groupAccount",
});

module.exports = ReservedOpportunityList;
