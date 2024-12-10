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
  image_path: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
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
  restrictions: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
  segments: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
  suitable_for: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
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
        date_time: 1733743649,
        image_path: [
          "https://images.pexels.com/photos/5531015/pexels-photo-5531015.jpeg?auto=compress&cs=tinysrgb&w=600",
          "https://images.pexels.com/photos/7263005/pexels-photo-7263005.jpeg?auto=compress&cs=tinysrgb&w=600",
          "https://images.pexels.com/photos/5531010/pexels-photo-5531010.jpeg?auto=compress&cs=tinysrgb&w=600",
        ],
        title: "Goods Collection",
        category: "In-Person Opportunity",
        state: "Pakistan",
        description: "Join us for Goods Collection!",
        hours: 20,
        favorite: false,
        full_address: "Chungi Amer sidho, Lahore Pakistan",
        donationAmount: 15,
        latitude: 31.451792,
        longitude: 74.352169,
        location_detail: "Chungi Amer siduo Lahore",
        cause: "This is test data",
        preparation: "preparation for event",
        suitable_for: ["Adults", "Male", "FeMale"],
        segments: ["Goods Collection"],
        about:
          "Meal Service feeds approximately 800 individuals in the skidrow area. As a Volunteer, you will have the opportunity to tour our facility and learn from those who live on grounds.",
        volunteers: [
          {
            name: "Ronaldo",
            profile_description:
              "Our Mission is to help homeless individuals in Pakistan.",
            profile_image:
              "https://images.pexels.com/photos/29660246/pexels-photo-29660246/free-photo-of-portrait-of-a-man-wearing-a-graphic-baseball-cap.jpeg?auto=compress&cs=tinysrgb&w=600",
          },
        ],
        highlights: [
          {
            text: "Wheelchair Accessible",
            image_path:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShbs3juN86bKsB8xsaY-FWxdQ6pB2lnL0lvQ&s",
          },
          {
            text: "Hands-on Experience",
            image_path:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShbs3juN86bKsB8xsaY-FWxdQ6pB2lnL0lvQ&s",
          },
          {
            text: "Orientation",
            image_path:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShbs3juN86bKsB8xsaY-FWxdQ6pB2lnL0lvQ&s",
          },
          {
            text: "Woman-Owned",
            image_path:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShbs3juN86bKsB8xsaY-FWxdQ6pB2lnL0lvQ&s",
          },
        ],
        services: [
          {
            text: " Wifi",
            image_path:
              "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
          {
            text: " Dedicated Workspace",
            image_path:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShbs3juN86bKsB8xsaY-FWxdQ6pB2lnL0lvQ&s",
          },
          {
            text: "Food/Drink Provided",
            image_path:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShbs3juN86bKsB8xsaY-FWxdQ6pB2lnL0lvQ&s",
          },
          {
            text: "Orientation Provided",
            image_path:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShbs3juN86bKsB8xsaY-FWxdQ6pB2lnL0lvQ&s",
          },
          {
            text: "Tour Provided",
            image_path:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShbs3juN86bKsB8xsaY-FWxdQ6pB2lnL0lvQ&s",
          },
        ],

        // Ensure proper Date objects are used for available_dates
        available_dates: [1733760000, 1733846400, 1733587200],

        all_reviews: [
          {
            rating_count: 3,
            date: 1733482800,
            name: "Gold Simith",
            profile_picture:
              "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
            address: "Lahore, Pakistan",
            role: "Manger",
            review: "Such a great Opportunity. So glad we went. ",
          },
          ,
          {
            rating_count: 4,
            date: 1733479200,
            name: "Lily",
            profile_picture:
              "https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369988.png",
            address: "Karachi Pakistan",
            role: "user",
            review: "Such a great Opportunity. So glad we went. ",
          },
          {
            rating_count: 3,
            date: 1733504400,
            name: "Peter",
            profile_picture:
              "https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png",
            address: "Faisal Abad Pakistan",
            role: "Manager",
            review: "Such a great Opportunity. So glad we went. ",
          },
        ],
        restrictions: [
          "Suitable for children (2-14 years)",
          "Suitable for pets",
          "Suitable for toddlers (2-14 years)",
          "Suitable for elderly",
        ],
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
