const Volunteer = require("../models/volunteer");
const { OpportunityList } = require("../models/opportunityList");
const ReservedOpportunityList = require("../models/opportunityReservation");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const { identifyUserType, getUserById } = require("../utils/userUtills");
exports.createReservedOpportunity = catchAsync(async (req, res, next) => {
  const { opportunityId, userId, boardingPass, opportunityDate } = req.body;
  if (!opportunityId || !userId || !opportunityDate) {
    return next(
      new appError("opportunityId, boardingPass, and  are required"),
      400
    );
  }
  const userType = identifyUserType(userId);
  if (userType !== "IndividualUser") {
    return next(
      new appError("Group Account user can't reserved the opportunity", 400)
    );
  }
  // get the user data here so we can create the volunteer by using this data
  const user = await getUserById(userId);
  if (!user) {
    return next(new appError("user not found ", 404));
  }

  // Check if the OpportunityList exists
  const opportunity = await OpportunityList.findByPk(opportunityId);
  if (!opportunity) {
    return next(new appError("Opportunity not found"), 404);
  }

  //check the host can't reserved the opportunity
  if (opportunity.userId === userId) {
    return next(
      new appError(
        "you are the host and you can't reserved your own opportunity",
        400
      )
    );
  }
  const reservedOpportunityExisting = await ReservedOpportunityList.findOne({
    where: { userId, opportunityDate },
  });
  if (reservedOpportunityExisting) {
    return next(
      new appError("Sorry! you have already reserved this opportunity.", 400)
    );
  }

  await Volunteer.create({
    opportunityId,
    userId,
    opportunityDate,
  });

  // Create the reservation
  const reservedOpportunity = await ReservedOpportunityList.create({
    opportunityId,
    userId,
    opportunityDate,
  });

  // Respond with success
  res.status(201).json({
    status: "success",
    message: "Opportunity reserved successfully",
    data: reservedOpportunity,
  });
});

exports.deleteReservedOpportunity = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new appError("id is required", 404));
  }
  const reservedOpportunity = await ReservedOpportunityList.findByPk(id);
  if (!reservedOpportunity) {
    return next(
      new appError("reserved opportunity against this id is not found", 404)
    );
  }

  await reservedOpportunity.destroy();
  res.status(204).json({
    status: "success",
    message: "reserved opportunity is deleted successfully",
  });
});

exports.approvedReservedOpportunity = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    return next(new appError("ud us required", 400));
  }
  const reservedOpportunity = await ReservedOpportunityList.findByPk(id);
  if (!reservedOpportunity) {
    return next(new appError("reserved opportunity is not found"));
  }
  await reservedOpportunity.update({ isApproved: true });

  res.status(200).json({
    status: "success",
    message: "reserved opportunity is approved now",
  });
});
