const cathAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const { OpportunityList } = require("../models/opportunityList");
const Volunteer = require("../models/volunteer");
const Review = require("../models/review");
const Service = require("../models/services");
const Highlight = require("../models/highlight");
const Restriction = require("../models/restriction");
const AvailableDate = require("../models/availableDate");

// Get all opportunities
// exports.getAllOpportunities = async (req, res) => {
//   try {
//     const opportunities = await OpportunityList.findAll({
//       include: [
//         { model: Volunteer, as: "volunteers" },
//         { model: Highlight, as: "highlights" },
//         { model: Service, as: "services" },
//         // { model: AvailableDate, as: "available_dates" },
//         { model: Review, as: "all_reviews" },
//         { model: Restriction, as: "restrictions" },
//       ],
//     });
//     res.status(200).json(opportunities);
//   } catch (error) {
//     console.error("Error fetching opportunities:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to retrieve opportunities", error });
//   }
// };

exports.getAllOpportunities = cathAsync(async (req, res, next) => {
  const opportunities = await OpportunityList.findAll({
    include: [
      { model: Volunteer, as: "volunteers" },
      { model: Highlight, as: "highlights" },
      { model: Service, as: "services" },
      { model: Review, as: "all_reviews" },
      // { model: Restriction, as: "restrictions" },
    ],
  });

  if (!opportunities) {
    return next(new appError("There is no record", 404));
  }

  // Calculate average rating for each opportunity
  const opportunitiesWithRatings = opportunities.map((opportunity) => {
    const reviews = opportunity.all_reviews || [];
    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating_count,
      0
    );
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    return {
      ...opportunity.toJSON(), // Convert Sequelize instance to plain object
      average_rating: averageRating.toFixed(2),
    };
  });

  res.status(200).json({ status: "success", opportunitiesWithRatings });
});

// Get a single opportunity by ID
const getOpportunityById = async (req, res) => {
  const { id } = req.params;
  try {
    const opportunity = await OpportunityList.findByPk(id);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    res.status(200).json(opportunity);
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    res.status(500).json({ message: "Failed to retrieve opportunity", error });
  }
};

// Create a new opportunity
const createOpportunity = async (req, res) => {
  try {
    const newOpportunity = await OpportunityList.create(req.body);
    res.status(201).json(newOpportunity);
  } catch (error) {
    console.error("Error creating opportunity:", error);
    res.status(400).json({ message: "Failed to create opportunity", error });
  }
};

// Update an opportunity by ID
const updateOpportunity = async (req, res) => {
  const { id } = req.params;
  try {
    const [updated] = await OpportunityList.update(req.body, { where: { id } });
    if (!updated) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    const updatedOpportunity = await OpportunityList.findByPk(id);
    res.status(200).json(updatedOpportunity);
  } catch (error) {
    console.error("Error updating opportunity:", error);
    res.status(400).json({ message: "Failed to update opportunity", error });
  }
};

// Delete an opportunity by ID
const deleteOpportunity = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await OpportunityList.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    res.status(500).json({ message: "Failed to delete opportunity", error });
  }
};

// module.exports = {
//   getAllOpportunities,
//   getOpportunityById,
//   createOpportunity,
//   updateOpportunity,
//   deleteOpportunity,
// };

exports.updateFavoriteStatus = cathAsync(async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;

  // Find the opportunity by ID
  const opportunity = await OpportunityList.findByPk(id);

  if (!opportunity) {
    return next(new appError("Opportunity not found", 404));
  }

  // Update the favorite field
  opportunity.favorite = favorite;
  await opportunity.save();
  res.status(200).json({ message: "Favorite status updated successfully" });
});

exports.getFavoriteOpportunities = cathAsync(async (req, res, next) => {
  const favoriteOpportunities = await OpportunityList.findAll({
    where: { favorite: true },
    include: [
      { model: Volunteer, as: "volunteers" },
      { model: Highlight, as: "highlights" },
      { model: Service, as: "services" },
      { model: Review, as: "all_reviews" },
    ],
  });

  if (favoriteOpportunities.length === 0) {
    return next(new appError("No favorite opportunities found", 404));
  }

  res.status(200).json({ status: "success", favoriteOpportunities });
});