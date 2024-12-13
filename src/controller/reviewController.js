const { OpportunityList } = require("../models/opportunityList");
const Review = require("../models/review");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");

exports.createReview = catchAsync(async (req, res, next) => {
  const {
    OpportunityListId,
    rating_count,
    date,
    role,
    review,
    profile_picture,
    name,
    address,
  } = req.body;

  // Validate required fields
  if (!rating_count || !date || !OpportunityListId) {
    return next(
      new appError(
        "Rating count, date, and opportunityListId are required to create a review.",
        400
      )
    );
  }

  // Check if the parent opportunity exists
  const opportunity = await OpportunityList.findByPk(OpportunityListId);
  if (!opportunity) {
    return next(
      new appError(
        "Opportunity not found. Please provide a valid opportunityListId.",
        404
      )
    );
  }

  // Create a new review and associate it with the parent opportunity
  const newReview = await Review.create({
    rating_count,
    date,
    role,
    review,
    profile_picture,
    name,
    address,
    OpportunityListId, // Associate with the parent opportunity
  });

  // Respond with success
  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    data: newReview,
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Check if the review exists
  const review = await Review.findByPk(id);
  if (!review) {
    return next(
      new appError("Review not found. Please provide a valid review ID.", 404)
    );
  }

  // Delete the review
  await review.destroy();

  // Respond with success
  res.status(200).json({
    status: "success",
    message: "Review deleted successfully",
  });
});
