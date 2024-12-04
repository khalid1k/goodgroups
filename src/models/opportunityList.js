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
  //   date_time: {
  //     type: DataTypes.INTEGER, // Store epoch as an integer
  //     allowNull: false,
  //     get() {
  //       const rawValue = this.getDataValue("date_time");
  //       return rawValue ? new Date(rawValue * 1000) : null; // Convert epoch to Date object
  //     },
  //     set(value) {
  //       this.setDataValue(
  //         "date_time",
  //         Math.floor(new Date(value).getTime() / 1000)
  //       ); // Store as epoch
  //     },
  //   },
  image_path: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  average_rating: { type: DataTypes.FLOAT, allowNull: false },
  //   reviews: { type: DataTypes.INTEGER, allowNull: false },
  hours: { type: DataTypes.INTEGER, allowNull: false },
  favorite: { type: DataTypes.BOOLEAN, defaultValue: false },
  about: { type: DataTypes.TEXT },
  latitude: { type: DataTypes.FLOAT },
  longitude: { type: DataTypes.FLOAT },
  full_address: { type: DataTypes.STRING, allowNull: false },
  location_detail: { type: DataTypes.TEXT },
  cause: { type: DataTypes.STRING },
  preparation: { type: DataTypes.TEXT },
  donationAmount: { type: DataTypes.INTEGER, allowNull: false },
});

OpportunityList.hasMany(Volunteer, { as: "volunteers" });
OpportunityList.hasMany(Highlight, { as: "highlights" });
OpportunityList.hasMany(Service, { as: "services" });
OpportunityList.hasMany(AvailableDate, { as: "available_dates" });
OpportunityList.hasMany(Review, { as: "all_reviews" });
OpportunityList.hasMany(Restriction, { as: "restrictions" });

Volunteer.belongsTo(OpportunityList);
Highlight.belongsTo(OpportunityList);
Service.belongsTo(OpportunityList);
AvailableDate.belongsTo(OpportunityList);
Review.belongsTo(OpportunityList);
Restriction.belongsTo(OpportunityList);

const createOpportunityListData = async () => {
  try {
    console.log("createOpportunity list function is called");
    const newOpportunity = await OpportunityList.create(
      {
        date_time: 1733325408,
        image_path:
          "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        title: "Serving food",
        category: "In-Person",
        state: "California",
        description: "Join us in cleaning up the community park!",
        average_rating: 4.3,
        hours: 100,
        favorite: false,
        full_address: "123 Main St, Los Angeles, CA",
        donationAmount: 10,

        // Nested Data
        volunteers: [
          {
            name: "John Doe",
            profile_description: "Environmental Enthusiast",
            profile_image:
              "https://images.pexels.com/photos/7562313/pexels-photo-7562313.jpeg?auto=compress&cs=tinysrgb&w=600",
          },
          {
            name: "Jane Smith",
            profile_description: "Community Organizer",
            profile_image:
              "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
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
          { date: new Date("2024-12-10") },
          { date: new Date("2024-12-04") },
        ],

        all_reviews: [
          {
            text: "Great event!",
            rating: 5,
            rating_count: 1, // Ensure you provide the required rating_count
            date: new Date(), // Provide a valid date
          },
          ,
          {
            text: "good event!",
            rating: 5,
            rating_count: 5, // Ensure you provide the required rating_count
            date: new Date(),
          },
        ],
        restrictions: [{ description: "Must be 18 or older" }],
      },
      {
        include: [
          { model: Volunteer, as: "volunteers" },
          { model: Highlight, as: "highlights" },
          { model: Service, as: "services" },
          { model: AvailableDate, as: "available_dates" },
          { model: Review, as: "all_reviews" },
          { model: Restriction, as: "restrictions" },
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
