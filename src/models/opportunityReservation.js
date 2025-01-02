const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { OpportunityList } = require("./opportunityList");
const IndividualUser = require("./individual-account");
const GroupAccount = require("./group-account");

const ReservedOpportunityList = sequelize.define(
  "ReservedOpportunityList",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    opportunityId: {
      type: DataTypes.UUID,
      references: {
        model: OpportunityList,
        key: "id",
      },
      allowNull: false,
    },
    // Can store user information as either Individual or Group
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    boardingPass: {
      type: DataTypes.STRING,
    },
    checkedIn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    opportunityDate: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    tableName: "ReservedOpportunityList",
  }
);

// Associations
ReservedOpportunityList.belongsTo(OpportunityList, {
  foreignKey: "opportunityId",
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
