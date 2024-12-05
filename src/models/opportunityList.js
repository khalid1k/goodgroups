const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Restriction = require("./restriction");
const Review = require("./review");
const AvailableDate = require("./availableDate");
const Service = require("./services");
const Highlight = require("./highlight");
const Volunteer = require("./volunteer");

const OpportunityList = sequelize.define("OpportunityList", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  date_time: { type: DataTypes.INTEGER, allowNull: false },
  image_path: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  hours: { type: DataTypes.INTEGER, allowNull: false },
  favorite: { type: DataTypes.BOOLEAN, defaultValue: false },
  about: { type: DataTypes.TEXT },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  full_address: { type: DataTypes.STRING, allowNull: false },
  location_detail: { type: DataTypes.TEXT },
  cause: { type: DataTypes.STRING },
  preparation: { type: DataTypes.TEXT },
  donationAmount: { type: DataTypes.INTEGER, allowNull: false },
  available_dates: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  },
  restrictions: { type: DataTypes.ARRAY(DataTypes.STRING) },
  segments: { type: DataTypes.STRING },
  suitable_for: { type: DataTypes.ARRAY(DataTypes.STRING) },
});

OpportunityList.hasMany(Volunteer, { as: "volunteers" });
OpportunityList.hasMany(Highlight, { as: "highlights" });
OpportunityList.hasMany(Service, { as: "services" });
// OpportunityList.hasMany(AvailableDate, { as: "available_dates" });
OpportunityList.hasMany(Review, { as: "all_reviews" });
// OpportunityList.hasMany(Restriction, { as: "restrictions" });

Volunteer.belongsTo(OpportunityList);
Highlight.belongsTo(OpportunityList);
Service.belongsTo(OpportunityList);
// AvailableDate.belongsTo(OpportunityList);
Review.belongsTo(OpportunityList);
// Restriction.belongsTo(OpportunityList);

const createOpportunityListData = async () => {
  try {
    console.log("createOpportunity list function is called");
    const newOpportunity = await OpportunityList.create(
      {
        date_time: 1733399524,
        image_path:
          "https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        title: "Education",
        category: "Online",
        state: "New America",
        description: "Join us to spread the Education!",
        hours: 200,
        favorite: false,
        full_address: " Main Road Gubberg, Street, Los Angeles, CA",
        donationAmount: 25,
        latitude: 31.464437,
        longitude: 74.243794,
        location_detail: "near the Yasir Broast",
        cause: "This is test data",
        preparation: "preparation for event",
        suitable_for: ["Male", "FeMale"],
        segments: "Education",
        volunteers: [
          {
            name: "peter",
            profile_description: "Education Specialist",
            profile_image:
              "https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
        ],
        highlights: [
          {
            text: "Wheelchair Accessible",
            image_path:
              "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
        ],
        services: [
          {
            text: "Snacks Provided",
            image_path:
              "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
        ],

        // Ensure proper Date objects are used for available_dates
        available_dates: [
          1733658724, 1733572324, 1733485924, 1733399524, 1733313124,
        ],

        all_reviews: [
          {
            text: "Great event!",
            rating_count: 3,
            date: 1733485924,
          },
          ,
          {
            text: "good event!",
            rating_count: 4,
            date: 1733399525,
          },
          {
            text: "good event!",
            rating_count: 3.6,
            date: 1733399524,
          },
        ],
        restrictions: ["Suitable for elderly"],
      },
      {
        include: [
          { model: Volunteer, as: "volunteers" },
          { model: Highlight, as: "highlights" },
          { model: Service, as: "services" },
          // { model: AvailableDate, as: "available_dates" },
          { model: Review, as: "all_reviews" },
          // { model: Restriction, as: "restrictions" },
        ],
      }
    );

    console.log(
      "Opportunity with related data created:",
      newOpportunity.toJSON()
    );
  } catch (error) {
    console.error("Error inserting opportunity with related data:", error);
  }
};

module.exports = { OpportunityList, createOpportunityListData };
