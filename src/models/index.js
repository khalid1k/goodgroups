const IndividualUser = require("./individual-account");
const GroupAccount = require("./group-account");
const { OpportunityList } = require("./opportunityList");

// Define IndividualUser - OpportunityList Relationship
IndividualUser.hasMany(OpportunityList, {
  foreignKey: "user_id",
  constraints: false,
  scope: { accountType: "IndividualUser" },
});
OpportunityList.belongsTo(IndividualUser, {
  foreignKey: "user_id",
  constraints: false,
});

// Define GroupAccount - OpportunityList Relationship
GroupAccount.hasMany(OpportunityList, {
  foreignKey: "user_id",
  constraints: false,
  scope: { accountType: "GroupAccount" },
});
OpportunityList.belongsTo(GroupAccount, {
  foreignKey: "user_id",
  constraints: false,
});
