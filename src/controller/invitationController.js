const { OpportunityList } = require("../models/opportunityList");
const Invitation = require("../models/invitation");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const { getUserById } = require("../utils/userUtills");
// Create a new invitation
exports.createInvitation = catchAsync(async (req, res, next) => {
  const { opportunityId, invitedBy, invitedTo } = req.body;

  const opportunity = await OpportunityList.findByPk(opportunityId);
  if (!opportunity) {
    return next(new appError("Opportunity not found", 404));
  }

  // Validate users (invitedBy and invitedTo)
  const inviter = await getUserById(invitedBy);
  const invitee = await getUserById(invitedTo);

  if (!inviter) {
    return next(new appError("InvitedBy user not found", 404));
  }
  if (!invitee) {
    return next(new appError("InvitedTo user not found", 404));
  }

  // Create the invitation
  const invitation = await Invitation.create({
    opportunityId,
    invitedBy,
    invitedTo,
  });

  res
    .status(201)
    .json({ message: "Invitation created successfully", invitation });
});

exports.deleteInvitation = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const invitation = await Invitation.findByPk(id);
  if (!invitation) {
    return next(
      new appError(
        "Invitation not found. Please provide a valid Invitation ID.",
        404
      )
    );
  }

  // Delete the review
  await invitation.destroy();

  // Respond with success
  res.status(200).json({
    status: "success",
    message: "invitation deleted successfully",
  });
});

// Get all invitations
const getAllInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.findAll({
      include: [{ model: OpportunityList }],
    });

    res.status(200).json(invitations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch invitations", error });
  }
};

// Get invitations by opportunity
const getInvitationsByOpportunity = async (req, res) => {
  const { opportunityId } = req.params;

  try {
    const invitations = await Invitation.findAll({
      where: { opportunityId },
      include: [{ model: OpportunityList }],
    });

    if (!invitations.length) {
      return res
        .status(404)
        .json({ message: "No invitations found for this opportunity" });
    }

    res.status(200).json(invitations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch invitations", error });
  }
};
