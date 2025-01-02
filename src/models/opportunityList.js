const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Review = require("./review");
const GroupAccount = require("./group-account");
const Volunteer = require("./volunteer");
const IndividualUser = require("./individual-account");

const OpportunityList = sequelize.define(
  "OpportunityList",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: { type: DataTypes.BIGINT },
    images: { type: DataTypes.ARRAY(DataTypes.STRING) },
    opportunityTitle: { type: DataTypes.STRING },
    opportunityType: {
      type: DataTypes.ENUM("In-person", "Online", "Skills-based"),
      defaultValue: "In-person",
    },
    backgroundCheck: {
      type: DataTypes.STRING,
      defaultValue: "no",
    },
    minParticipants: { type: DataTypes.INTEGER },
    maxParticipants: { type: DataTypes.INTEGER },
    waiver: { type: DataTypes.STRING },
    assignedManagers: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
      defaultValue: [],
    },
    cancellationPolicy: {
      type: DataTypes.ENUM("Flexible", "Moderate", "Super Strict"),
      defaultValue: "Flexible",
    },

    listingStatus: { type: DataTypes.ENUM("published", "inprogress", "pause") },
    howToPrepare: { type: DataTypes.TEXT },
    opportunityAccess: {
      type: DataTypes.ENUM("Public", "Private"),
      defaultValue: "Public",
    },
    description: { type: DataTypes.TEXT },
    favorite: { type: DataTypes.BOOLEAN, defaultValue: false },
    latitude: { type: DataTypes.FLOAT, defaultValue: 37.028933 },
    longitude: { type: DataTypes.FLOAT, defaultValue: -119.428072 },
    fullAddress: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    locationDetails: { type: DataTypes.TEXT },
    donationAmount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    availableDates: {
      type: DataTypes.ARRAY(DataTypes.BIGINT),
      defaultValue: [],
    },

    participantTypes: { type: DataTypes.ARRAY(DataTypes.STRING) },
    services: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    participantHighlights: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    restrictions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    adminSuggestion: {
      type: DataTypes.STRING,
      defaultValue: "Recommended",
    },
    duration: {
      type: DataTypes.ARRAY(DataTypes.BIGINT),
      validate: {
        isArrayOfTwo(value) {
          if (!Array.isArray(value) || value.length !== 2) {
            return new Error(
              "Duration must be an array with exactly two values [start_time, end_time]"
            );
          }
          if (value[0] >= value[1]) {
            return new Error("start_time must be less than end_time");
          }
        },
      },
    },
    subSegment: {
      type: DataTypes.STRING,
    },
    topSegment: {
      type: DataTypes.STRING,
    },
    recurring: {
      type: DataTypes.STRING,
    },
    opportunityPartner: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    waiverType: {
      type: DataTypes.STRING,
      defaultValue: "goodgroups default waiver",
    },
    showLocation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    impact: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "OpportunityList",
  }
);
IndividualUser.hasMany(OpportunityList, {
  foreignKey: "userId",
  constraints: false,
  scope: { accountType: "IndividualUser" },
});
// OpportunityList.belongsTo(IndividualUser, {
//   foreignKey: "userId",
//   constraints: false,
// });
OpportunityList.belongsTo(IndividualUser, {
  as: "individualHost", // Alias for the host association
  foreignKey: "userId",
});

// Define GroupAccount - OpportunityList Relationship
GroupAccount.hasMany(OpportunityList, {
  foreignKey: "userId",
  constraints: false,
  scope: { accountType: "GroupAccount" },
});
// OpportunityList.belongsTo(GroupAccount, {
//   foreignKey: "userId",
//   constraints: false,
// });
OpportunityList.belongsTo(GroupAccount, {
  as: "groupHost",
  foreignKey: "userId",
});
// OpportunityList.hasMany(Volunteer, { as: "volunteers" });
OpportunityList.hasMany(Review, { as: "all_reviews" });
OpportunityList.belongsTo(IndividualUser, {
  foreignKey: "userId",
  as: "host",
});
// Volunteer.belongsTo(OpportunityList);
Review.belongsTo(OpportunityList);
OpportunityList.hasMany(Volunteer, {
  foreignKey: "opportunityId",
  as: "volunteers",
});

Volunteer.belongsTo(OpportunityList, {
  foreignKey: "opportunityId",
  as: "opportunity", // Alias for accessing the opportunity
});
module.exports = { OpportunityList };
