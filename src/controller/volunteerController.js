const Volunteer = require("../models/volunteer");
const { OpportunityList } = require("../models/opportunityList");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
exports.createVolunteer = catchAsync(async (req, res, next) => {
  const { opportunityId, name, profile_description, profile_image } = req.body;

  // Validate required fields
  if (!name || !opportunityId) {
    return next(
      new appError(
        "Name and opportunityId are required to create a volunteer.",
        400
      )
    );
  }

  // Check if the parent opportunity exists
  const opportunity = await OpportunityList.findByPk(opportunityId);
  if (!opportunity) {
    return next(
      new appError(
        "Opportunity not found. Please provide a valid opportunityId.",
        404
      )
    );
  }

  // Create a new volunteer
  const newVolunteer = await Volunteer.create({
    name,
    profile_description,
    profile_image,
    opportunityId, // Associate with the parent opportunity
  });

  // Respond with success
  res.status(201).json({
    status: "success",
    message: "Volunteer created successfully",
    data: newVolunteer,
  });
});

exports.deleteVolunteer = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Check if the volunteer exists
  const volunteer = await Volunteer.findByPk(id);
  if (!volunteer) {
    return next(
      new appError("Volunteer not found. Please provide a valid ID.", 404)
    );
  }

  // Delete the volunteer
  await volunteer.destroy();

  // Respond with success
  res.status(200).json({
    status: "success",
    message: "Volunteer deleted successfully",
  });
});
