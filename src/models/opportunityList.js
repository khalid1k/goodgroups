const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Review = require("./review");

const Volunteer = require("./volunteer");

const OpportunityList = sequelize.define("OpportunityList", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  date_time: { type: DataTypes.BIGINT, allowNull: false },
  image_path: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  background_check: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "no",
  },
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
  services: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  highlights: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  // duration: {
  //   type: DataTypes.ARRAY(DataTypes.INTEGER),
  //   allowNull: false,
  //   validate: {
  //     isArrayOfTwo(value) {
  //       if (!Array.isArray(value) || value.length !== 2) {
  //         throw new Error("Duration must be an array with exactly two values [start_time, end_time]");
  //       }
  //       if (value[0] >= value[1]) {
  //         throw new Error("start_time must be less than end_time");
  //       }
  //     },
  //   },
  // },
});

OpportunityList.hasMany(Volunteer, { as: "volunteers" });
OpportunityList.hasMany(Review, { as: "all_reviews" });

Volunteer.belongsTo(OpportunityList);
Review.belongsTo(OpportunityList);

const createOpportunityListData = async () => {
  try {
    console.log("createOpportunity list function is called");

    const newOpportunity = await OpportunityList.create(
      {
        date_time: 1733864619,
        image_path: [
          "https://images.pexels.com/photos/5490975/pexels-photo-5490975.jpeg?auto=compress&cs=tinysrgb&w=600",
          "https://images.pexels.com/photos/5097282/pexels-photo-5097282.jpeg?auto=compress&cs=tinysrgb&w=600",
          "https://images.pexels.com/photos/6161503/pexels-photo-6161503.jpeg?auto=compress&cs=tinysrgb&w=600",
        ],
        title: "Health services",
        category: "In-Person Opportunity",
        state: "Pakistan",
        description: "Join us to know about Tech!",
        hours: 12,
        favorite: false,
        full_address: "Toakher Niaz baig Pakistan, Lahore Pakistan",
        donationAmount: 0,
        latitude: 31.472784,
        longitude: 74.24057,
        location_detail: "Toakher Niaz Baig Lahore",
        cause: "This is test data",
        preparation: "Preparation for the event",
        suitable_for: ["Adults", "Male", "Female"],
        segments: ["Goods Collection"],
        about:
          "Meal Service feeds approximately 800 individuals in the skidrow area. As a Volunteer, you will have the opportunity to tour our facility and learn from those who live on grounds.",
        volunteers: [
          {
            name: "Lily",
            profile_description:
              "Our Mission is to help homeless individuals in Pakistan.",
            profile_image:
              "https://images.pexels.com/photos/6347743/pexels-photo-6347743.jpeg?auto=compress&cs=tinysrgb&w=600",
          },
        ],
        highlights: [
          {
            text: "Woman-Owned",
            image_path:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShbs3juN86bKsB8xsaY-FWxdQ6pB2lnL0lvQ&s",
          },

          {
            text: "Orientation",
            image_path: "https://example.com/orientation.png",
          },
        ],
        services: [
          {
            text: "Orientation Provided",
            image_path: "https://example.com/food-drink.png",
          },
        ],
        available_dates: [1733760000, 1733846400, 1733587200],
        all_reviews: [
          {
            rating_count: 2.4,
            date: 1733482800,
            name: "Gold Smith",
            profile_picture: "https://example.com/user1.png",
            address: "Lahore, Pakistan",
            role: "Manager",
            review: "Such a great opportunity. So glad we went.",
          },
          {
            rating_count: 1,
            date: 1733479200,
            name: "Lily",
            profile_picture: "https://example.com/user2.png",
            address: "Karachi, Pakistan",
            role: "User",
            review: "Such a great opportunity. So glad we went.",
          },
          {
            rating_count: 4,
            date: 1733504400,
            name: "Peter",
            profile_picture: "https://example.com/user3.png",
            address: "Faisalabad, Pakistan",
            role: "Manager",
            review: "Such a great opportunity. So glad we went.",
          },
        ],
        restrictions: [
          "Suitable for children (2-14 years)",
          "Suitable for pets",
          "Suitable for toddlers (2-14 years)",
        ],
      },
      {
        include: [
          { model: Volunteer, as: "volunteers" },
          { model: Review, as: "all_reviews" },
        ],
      }
    );

    console.log("New OpportunityList record created:", newOpportunity);
  } catch (error) {
    console.error("Error creating OpportunityList:", error);
  }
};

module.exports = { OpportunityList, createOpportunityListData };
