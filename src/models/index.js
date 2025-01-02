const IndividualUser = require("./individual-account");
const GroupAccount = require("./group-account");
const { OpportunityList } = require("./opportunityList");
const Invitation = require("../models/invitation");
const ReservedOpportunityList = require("./opportunityReservation");
// Define IndividualUser - OpportunityList Relationship
// IndividualUser.hasMany(OpportunityList, {
//   foreignKey: "userId",
//   constraints: false,
//   scope: { accountType: "IndividualUser" },
// });
// OpportunityList.belongsTo(IndividualUser, {
//   foreignKey: "userId",
//   constraints: false,
// });

// // Define GroupAccount - OpportunityList Relationship
// GroupAccount.hasMany(OpportunityList, {
//   foreignKey: "userId",
//   constraints: false,
//   scope: { accountType: "GroupAccount" },
// });
// OpportunityList.belongsTo(GroupAccount, {
//   foreignKey: "userId",
//   constraints: false,
// });

OpportunityList.hasMany(Invitation, {
  foreignKey: "opportunityId",
  onDelete: "CASCADE",
});

Invitation.belongsTo(OpportunityList, {
  foreignKey: "opportunityId",
});

ReservedOpportunityList.belongsTo(OpportunityList, {
  foreignKey: "opportunityId",
});
