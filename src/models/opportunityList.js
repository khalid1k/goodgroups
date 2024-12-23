const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Review = require("./review");

const Volunteer = require("./volunteer");

const OpportunityList = sequelize.define(
  "OpportunityList",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_time: { type: DataTypes.BIGINT },
    image_path: { type: DataTypes.ARRAY(DataTypes.STRING) },
    title: { type: DataTypes.STRING },
    category: {
      type: DataTypes.ENUM("In-person", "Online", "Skills-based"),
      defaultValue: "In-person",
    },
    background_check: {
      type: DataTypes.STRING,
      defaultValue: "no",
    },
    minimum_participants: { type: DataTypes.INTEGER },
    maximum_participants: { type: DataTypes.INTEGER },
    partner_cohost_group: { type: DataTypes.STRING },
    impact_reporting: { type: DataTypes.STRING },
    waiver: { type: DataTypes.STRING },
    assigned_managers: { type: DataTypes.ARRAY(DataTypes.STRING) },
    cancellation_policy: {
      type: DataTypes.ENUM("Flexible", "Moderate", "Super Strict"),
      defaultValue: "Flexible",
    },

    listing_status: { type: DataTypes.ENUM("published", "inprogress") },
    prepare_plane_description: { type: DataTypes.TEXT },
    opportunity_access: {
      type: DataTypes.ENUM("Public", "Private"),
      defaultValue: "Public",
    },
    description: { type: DataTypes.TEXT },
    hours: { type: DataTypes.INTEGER },
    favorite: { type: DataTypes.BOOLEAN, defaultValue: false },
    latitude: { type: DataTypes.FLOAT },
    longitude: { type: DataTypes.FLOAT },
    full_address: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    location_detail: { type: DataTypes.TEXT },
    donationAmount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    available_dates: {
      type: DataTypes.ARRAY(DataTypes.BIGINT),
    },

    suitable_for: { type: DataTypes.ARRAY(DataTypes.STRING) },
    services: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    highlights: {
      type: DataTypes.ARRAY(DataTypes.STRING),
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
    segments: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: "OpportunityList",
  }
);

OpportunityList.hasMany(Volunteer, { as: "volunteers" });
OpportunityList.hasMany(Review, { as: "all_reviews" });

Volunteer.belongsTo(OpportunityList);
Review.belongsTo(OpportunityList);

module.exports = { OpportunityList };
