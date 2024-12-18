const GroupAccount = require("../models/group-account");
const IndividualUser = require("../models/individual-account");
const { OpportunityList } = require("../models/opportunityList");
const ReservedOpportunityList = require("../models/opportunityReservation");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
exports.createReservedOpportunity = catchAsync(async (req, res, next) => {
  const { opportunityListId, userId, userType } = req.body;

  // Validate input
  if (!opportunityListId || !userId || !userType) {
    return next(
      new appError("opportunityListId, userId, and userType are required"),
      400
    );
  }

  if (!["IndividualUser", "GroupAccount"].includes(userType)) {
    return next(
      new appError(
        "Invalid userType, must be 'IndividualUser' or 'GroupAccount'"
      ),
      400
    );
  }

  // Check if the OpportunityList exists
  const opportunity = await OpportunityList.findByPk(opportunityListId);
  if (!opportunity) {
    return next(new appError("Opportunity not found"), 404);
  }

  // Check if the user exists based on userType
  let user;
  if (userType === "IndividualUser") {
    user = await IndividualUser.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "IndividualUser not found" });
    }
  } else if (userType === "GroupAccount") {
    user = await GroupAccount.findByPk(userId);
    if (!user) {
      return next(new appError("GroupAccount not found"), 404);
    }
  }

  // Create the reservation
  const reservedOpportunity = await ReservedOpportunityList.create({
    opportunityListId,
    userId,
    userType,
  });

  // Respond with success
  res.status(201).json({
    status: "success",
    message: "Opportunity reserved successfully",
    data: reservedOpportunity,
  });
});
